# Systemd template for SSH reverse proxy unit

These are useful when you would like to expose a synced node RPC or WebSocket interface but you are behind a private network.

Work based on this guide

https://gist.github.com/drmalex07/c0f9304deea566842490

requires a passwordless private key at `/etc/ssh/${PRIVATE_KEY}` and the first connection must by made by the root user to verify the key fingerprint. If you skip this step, you will see "Host key verification failed" in the logs.

Arbitrary tunnels can be configured and managed simply by creating different filenames in `/etc/default/`
