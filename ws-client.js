$(document).ready(function() {

    doc_ready();

});

function doc_ready() {

	var wsconn = ws_init(prompt_name());

}

function ws_init(callback) {

	var wsconn = new WebSocket('ws://maxbook.local:8081');

	wsconn.onopen = function(e) {
	    console.log("Connection established!");
		$('body').data('wsconn', wsconn);
	    callback();
	};

	wsconn.onmessage = function(e) {
	    console.log('receive message: ' + e.data);
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

function prompt_name(wsconn) {

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
			})
		),
		$('<input />').attr({
			type: 'submit',
			value: 'OK'
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
		}
		message_input.focus();
	});

}

function send_ws_message() {

	var wsconn = $('body').data('wsconn');
	var name = $('body').data('name');
	var message = $('body').data('message');

	if (wsconn) {

		var data = message ? name + '@' + message : '@' + name;
		console.log('Send: ' + data);
		wsconn.send(data);

	};

}
