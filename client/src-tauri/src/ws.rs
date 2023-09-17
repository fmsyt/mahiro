use futures_util::{StreamExt, SinkExt};
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tokio::net::{TcpListener, TcpStream};

use crate::client::{ReceivedMessage, load_state, State as ClientState, SendWebSocketClientMessage, ReceiveWebSocketClientMessage};

pub async fn start_server(_config_directory_path: String) {
    let addr: String = "0.0.0.0:8080".to_string();
    println!("Listening on: {}", addr);

    let try_socket: Result<TcpListener, std::io::Error> = TcpListener::bind(addr).await;
    let listener: TcpListener = try_socket.expect("Failed to bind");

    while let Ok((stream, _addr)) = listener.accept().await {
        let client_state = load_state(_config_directory_path.clone());
        tokio::spawn(handle_websocket_client(stream, client_state));
    }
}

async fn handle_websocket_client(stream: TcpStream, client_state: ClientState) {
    let try_ws_stream = accept_async(stream).await;

    if let Err(e) = try_ws_stream {
        eprintln!("Error during the websocket handshake occurred: {}", e);
        return;
    }

    let ws_stream = try_ws_stream.unwrap();
    let (mut write, mut read) = ws_stream.split();



    while let Some(message) = read.next().await {

        if let Err(e) = message {
            eprintln!("Error during receive: {}", e);
            break;
        }

        if let Ok(Message::Text(text)) = message {

            if text == "" {
                continue;
            }

            if let Ok(message) = serde_json::from_str::<ReceivedMessage>(&text) {

                match message.method.as_str() {
                    "emit" => {

                        if let Some(data) = message.data {
                            if let Err(e) = client_state.emit(data.action, data.event) {
                                eprintln!("Error: {}", e);
                            }

                        } else {
                            eprintln!("Warn: Invalid emit message")
                        }

                    }
                    "general.update" => {
                    }
                    "sheets.update" => {
                        println!("sheets.update");
                        let message = client_state.sheets_update();
                        write.send(message).await.expect("Failed to send");
                    }
                    _ => {}
                }
            }
        }
    }

}
