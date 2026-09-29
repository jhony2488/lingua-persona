use tauri::Manager;
use tauri_plugin_shell::ShellExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let resource_dir = app.path().resource_dir()?;
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir).ok();

            let server_entry = resource_dir.join("server/standalone/server.js");
            let db_url = format!(
                "file:{}",
                data_dir.join("linguapersona.db").to_string_lossy()
            );

            let (mut rx, _child) = app
                .shell()
                .sidecar("linguapersona-server")?
                .args([server_entry.to_string_lossy().to_string()])
                .env("HOSTNAME", "127.0.0.1")
                .env("PORT", "3111")
                .env("DATABASE_URL", db_url)
                .spawn()?;

            tauri::async_runtime::spawn(async move {
                while let Some(_event) = rx.recv().await {}
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
