<?php

require __DIR__ . '/vendor/autoload.php';
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class Chat implements MessageComponentInterface {

    protected $clients;

    public function __construct() {
        $this->clients = new SplObjectStorage();
    }

    public function onOpen(ConnectionInterface $conn) {
        // Store the new connection to send messages to later
        $this->clients->attach($conn);

        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {

    	$clients = $this->clients;

    	$first_char = mb_substr($msg, 0, 1);

    	if ($first_char == '@') {

			$names_list = array();
			foreach ($clients as $client) {
				if ($clients->offsetGet($client)) {
					$names_list[] = $clients->offsetGet($client);
				}
			}
			if (count($name_list) > 0) {
				$names = implode(',', $names_list);
				$from->send('@' . $names);
			}

    		$username = mb_substr($msg, 1);
    		$clients->detach($from);
    		$clients->attach($from, $username);

    		$this->sendMessage($from, $clients, $msg);

			echo $from->resourceId . ' -> ' . $clients->offsetGet($from) . "\n";

    	} else {

	        $numRecv = count($this->clients) - 1;
	        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n"
	            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

	        $this->sendMessage($from, $clients, $msg);

    	}

    }

    public function onClose(ConnectionInterface $conn) {
        echo "Connection {$conn->resourceId}:{$this->clients->offsetGet($conn)} has disconnected\n";
        $this->sendMessage($conn, $this->clients, '!@' . $this->clients->offsetGet($conn));
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }

    private function sendMessage($from, $to, $msg) {

        foreach ($to as $client) {
            if ($from !== $client) {
                $client->send($msg);
            }
        }

    }

}

$chat = new HttpServer(
        	new WsServer(
            	new Chat()
        	)
    	);

$port = 8081;

$server = IoServer::factory($chat, $port);

echo 'start ws-server at ' . $port . "\n";

$server->run();


?>
