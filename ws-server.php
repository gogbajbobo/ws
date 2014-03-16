<?php

require __DIR__ . '/vendor/autoload.php';
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

date_default_timezone_set('Europe/Moscow');

class Chat implements MessageComponentInterface {

    protected $clients;

    public function __construct() {
        $this->clients = new SplObjectStorage();
    }

    public function onOpen(ConnectionInterface $conn) {
        // Store the new connection to send messages to later
        $this->clients->attach($conn);

        echo date('m/d/Y h:i:s a', time()) . " - New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {

    	// echo 'Message ' . $msg . ' from ' . $from->resourceId . "\n";

    	$clients = $this->clients;

    	$first_char = mb_substr($msg, 0, 1);

		$names_list = array();
		foreach ($clients as $client) {
			if ($clients->offsetGet($client)) {
				$names_list[$clients->offsetGet($client)] = $client;
			}
		}

    	if ($first_char == '@') {

			if (count(array_keys($names_list)) > 0) {
				$names = implode(',', array_keys($names_list));
				$from->send('@' . $names);
				echo $names;
			}

    		$username = mb_substr($msg, 1);
    		$clients->detach($from);
    		$clients->attach($from, $username);

    		$this->sendMessage($from, $clients, $msg);

			echo $from->resourceId . ' -> ' . $clients->offsetGet($from) . "\n";

    	} else {

    		$message = explode('@', $msg);
    		if ($message[1]) {

    			if ($names_list[$message[0]]) {
    				$names_list[$message[0]]->send($message[1] . '@' . $clients->offsetGet($from));
    				echo $message[0] . ' send message "' . $message[1] . '"" to ' . $clients->offsetGet($from) . "\n";
    			}

    		} else {

		        $numRecv = count($this->clients) - 1;
		        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n"
		            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

		        $this->sendMessage($from, $clients, $msg . '@' . $clients->offsetGet($from));

    		}

    	}

    }

    public function onClose(ConnectionInterface $conn) {
        echo date('m/d/Y h:i:s a', time()) . " - Connection {$conn->resourceId}:{$this->clients->offsetGet($conn)} has disconnected\n";
        $this->sendMessage($conn, $this->clients, '!@' . $this->clients->offsetGet($conn));
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $this->clients->detach($conn);
        $conn->close();
    }

    private function sendMessage($from, $to, $msg) {
        foreach ($to as $client) {
            if ($from !== $client && $to->offsetGet($client)) {
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
