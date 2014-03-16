$(document).ready(function() {

    doc_ready();

});

function doc_ready() {

	var wsconn = ws_init(
		function() {
			prompt_name();
		}, 
		function() {
			parse_message();
		}
	);

}

function ws_init(onopen, onmessage) {

	var wsconn = new WebSocket('ws://maxbook.local:8081');

	wsconn.onopen = function(e) {
	    console.log("Connection established!");
		$('body').data('wsconn', wsconn);
	    onopen();
	};

	wsconn.onmessage = function(e) {
	    console.log('receive message: ' + e.data);
	    $('body').data('message', e.data);
	    onmessage();
	};

	wsconn.onerror = function(e) {
		console.log(e.message);
	}

	wsconn.onclose = function(e) {
		console.log("Connection closed!");
		$('body').data('wsconn', null);
	}

	return wsconn;

}

function prompt_name() {

	var name_form = $('<form />').attr('id', 'name_form');
	$('body').append(name_form);
	$(name_form).append(
		$('<label />').append(
			'NAME:',
			$('<input />').attr({
				type: 'text',
				name: 'name',
				autofocus: 'autofocus',
			})
		),
		$('<input />').attr({
			type: 'submit',
			value: 'OK'
		})
	);

	$(name_form).submit(function(event) {
		$('body').data('message', null);
		event.preventDefault();
		var name_input = $('input[name=name]');
		var name = name_input.val();
		if (name != '') {
			$('body').data('name', name);
			show_chat();
			console.log('Name: ' + name);
			send_ws_message();
		} else {
			alert('Enter the name');
			name_input.focus();
		}
	});

}

function show_chat() {

	$('body').empty();
	$('body').prepend('<br />');
	var clients = $('<span />').attr('id', 'clients');
	$('body').prepend(clients);
	var name = $('body').data('name');

	var message_form = $('<form />').attr('id', 'message_form');
	$('body').append(message_form);
	$(message_form).append(
		$('<label />').append(
			name + ':',
			$('<input />').attr({
				type: 'text',
				name: 'message',
				autofocus: 'autofocus',
				size: '50'
			})
		),
		$('<input />').attr({
			type: 'submit',
			value: 'OK'
		})
	);

	$('body').append('<br />');
	$('body').append(
		$('<textarea />').attr({
			id: 'chatarea',
			rows: '20',
			cols: '55'
		})
	);

	$(message_form).submit(function(event) {
		event.preventDefault();
		var message_input = $('input[name=message]');
		var message = message_input.val();
		if (message != '') {
			$('body').data('message', message);
			send_ws_message();
			message_input.val(null);
			$('textarea#chatarea').val($('textarea#chatarea').val() + message + '\n');
		}
		message_input.focus();
	});

}

function send_ws_message() {

	var wsconn = $('body').data('wsconn');
	var name = $('body').data('name');
	var message = $('body').data('message');

	if (wsconn) {

		// var data = message ? name + '@' + message : '@' + name;
		var data = message ? message : '@' + name;
		console.log('Send: ' + data);
		wsconn.send(data);

	};

}

function parse_message() {

	var message = $('body').data('message');
	var firstChar = message.charAt(0);

	if (firstChar == '@') {

		if ($('span#clients').text() == '') {
			$('span#clients').text(message.substring(1));
		} else {
			$('span#clients').text([$('span#clients').text(), message.substring(1)].join());
		}

	} else if (firstChar == '!'){

		var clients = $('span#clients').text().split(',');
		clients.splice(clients.indexOf(message.substring(2)),1);
		$('span#clients').text(clients.join());

	} else {

		var msg = message.split('@');
		$('textarea#chatarea').val($('textarea#chatarea').val() + msg[1] + ': ' + msg[0] + '\n');

	};

}




