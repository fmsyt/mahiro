use futures_util::{StreamExt, SinkExt};
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tokio::net::{TcpListener, TcpStream};

pub async fn start_server() {
    let addr = "0.0.0.0:8080".to_string();

    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("Failed to bind");

    println!("Listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_client(stream));
    }
}

async fn handle_client(stream: TcpStream) {
    let ws_stream = accept_async(stream).await.expect("Failed to accept");

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
