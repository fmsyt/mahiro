
use std::collections::HashMap;

use serde::{Deserialize, Serialize};


use futures_util::{StreamExt, SinkExt};
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tokio::net::{TcpListener, TcpStream};

// union ReceivedMessageDataUnion {
//     method: String,
//     data: ReceivedEmitMessage,
// }

#[derive(Serialize, Deserialize, Debug)]
struct ReceivedMessage {
    method: String,
    data: Option<ReceivedEmitMessage>,
}

#[derive(Serialize, Deserialize, Debug)]
struct ReceivedEmitMessage {
    control_id: String,
    event_name: String,
    data: Option<HashMap<String, String>>,
}

pub async fn start_server(_config_directory_path: String) {
    let addr: String = "0.0.0.0:8080".to_string();
    println!("Listening on: {}", addr);

    let try_socket: Result<TcpListener, std::io::Error> = TcpListener::bind(addr).await;
    let listener: TcpListener = try_socket.expect("Failed to bind");


    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_client(stream));
    }
}

async fn handle_client(stream: TcpStream) {
    let ws_stream: tokio_tungstenite::WebSocketStream<TcpStream> = accept_async(stream).await.expect("Failed to accept");

    let (mut write, mut read) = ws_stream.split();

    while let Some(message) = read.next().await {
        println!("Received a message: {:?}", message);

        match message {
            Ok(Message::Text(text)) => {
                // メッセージを加工（大文字に変換）する例
                let response_text = text.to_uppercase();

                // 加工されたメッセージをクライアントに送信
                if let Err(e) = write.send(Message::Text(response_text)).await {
                    eprintln!("Failed to send response: {}", e);
                    break;
                }

                match serde_json::from_str::<ReceivedMessage>(&text) {
                    Ok(message) => {
                        println!("message: {:?}", message);

                        match message.method.as_str() {
                            "emit" => {
                                match message.data {
                                    Some(data) => {
                                        println!("data: {:?}", data);

                                        match base64::decode(data.control_id) {
                                            Ok(control_file_path) => {
                                                println!("control_id: {:?}", control_file_path);
                                            }
                                            Err(e) => {
                                                eprintln!("Warn: {}", e);
                                            }
                                        }

                                    }
                                    None => {
                                        eprintln!("Warn: Invalid emit message")
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                    Err(e) => {
                        eprintln!("Warn: {}", e);
                    }
                }
            }
            Ok(_) => {
                // テキスト以外のメッセージは無視する（オプション）
            }
            Err(e) => {
                eprintln!("Error while handling message: {}", e);
                break;
            }
        }

    }

}
