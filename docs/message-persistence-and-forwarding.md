# Message persistence and forarding

This document showacses some examples on how a worst and best case message exchange may happen,
in a case in which the server support delivery status reporting and read receipts are enabled.

## best case
Alice and Bob both have an active connection to the server.

1. Alice wants to send a message to Bob.
1. Alice sends that message to the server.
1. The server forwards that message to Bob.
1. The server can immediately send the delivery status to Alice.
1. As soon as Bob reads the message, Alice will be notified about Bob reading the message.

## worst case
Alice and bob sometimes have an active connection, but never at the same time.

1. Alice wants to send a message to Bob.
1. Alice sends that message to the server.
1. The server wants to forawrd the message to Bob, but he does not have an active connection.
1. The server persists the message and waits for Bob to reconnect.
1. As soon as Bob reconnects, the server will forward the pending message.
1. Bob receives the message and notifies the server about it.
1. The server wants to forward the delivery status, but Alice is not reachable.
1. The server persists the delivery status and waits for Alice to reconnect.
1. Alice reconnects and receives the delivery status.
1. Alice disconnects again.
1. Bob reads the message and notifies the server to send a read receipt.
1. The server wants to send the read receipt, but Alice is offline.
1. Alice reconnects and receives the notification about Bob having read the message.
