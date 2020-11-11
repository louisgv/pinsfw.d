import watcher from "nsfw";
import http from "http";
import handler from "serve-handler";
import url from "url";

import fs from "fs-extra";
import path from "path";

import WebSocket from "ws";
import { v1 as uuid } from "uuid";

import { getNetworkAddress } from "../core/utils";

const watchMap = new Map();

export const main = ({
	watchPath,
	webSocketPort,
	staticPort,
	setRestStatus,
	setSocketStatus,
	setWatcherStatus,
}) => {
	const absoluteWatchPath = path.join(process.env.PWD, watchPath);
	if (!fs.pathExistsSync(absoluteWatchPath)) {
		setSocketStatus("⛔\tShutdown all services", "red");
		setRestStatus("⛔\tError!", "red");
		setWatcherStatus(`⛔\t${absoluteWatchPath} does not exist`, "red");
		return;
	}

	const networkAddress = getNetworkAddress();

	const server = new http.Server((req, res) => {
		return handler(req, res, {
			public: absoluteWatchPath,
		});
	});

	server.listen(staticPort, "0.0.0.0", () => {
		setRestStatus(
			`🚀\tFile ready at http://${networkAddress}:${staticPort} `,
			"green"
		);
	});

	// console.log(pty);

	const socketServer = new http.Server();
	const wss1 = new WebSocket.Server({ noServer: true });

	wss1.on("connection", function connection(ws) {
		ws.on("message", async function incoming(message) {
			try {
				const data = Buffer.from(message).toString();
				// setSocketStatus(data);

				const args = JSON.parse(data);
				const { action, payload } = args;

				switch (action) {
					case "start": {
						const watchId = uuid();

						const progressWatcher = await watcher(absoluteWatchPath, (data) => {
							ws.send(
								JSON.stringify({
									watchId,
									type: "watch-data",
									data,
									success: true,
								})
							);
						});

						await progressWatcher.start();

						watchMap.set(watchId, progressWatcher);
						setWatcherStatus(
							`👁️\tWatching ${absoluteWatchPath} with id: ${watchId} `
						);
						break;
					}
					case "stop": {
						const { watchId: stopWatchId } = payload;
						if (!watchMap.has(stopWatchId)) return;
						// console.log(watchMap);

						await watchMap.get(stopWatchId).stop();

						watchMap.delete(stopWatchId);

						ws.send(
							JSON.stringify({
								success: true,
								type: "watch-stop",
								watchId: stopWatchId,
							})
						);
						break;
					}
					default:
						break;
				}
			} catch (error) {
				setWatcherStatus(`E\t${error.message}`, "red");
			}
		});
	});

	socketServer.on("upgrade", function upgrade(request, socket, head) {
		const pathname = url.parse(request.url).pathname;

		if (pathname === "/watch") {
			wss1.handleUpgrade(request, socket, head, function done(ws) {
				wss1.emit("connection", ws, request);
			});
		}
	});

	socketServer.listen(webSocketPort, "0.0.0.0", () => {
		setSocketStatus(
			`🚀\tSocket ready at ws://${networkAddress}:${webSocketPort} `,
			"green"
		);
	});

	process.on("SIGINT", () => {
		setRestStatus("⏹️\tShutdown app server", "cyan");
		setSocketStatus("⏹️\tShutdown socket server", "cyan");
		setWatcherStatus("⏹️\tShutdown file watcher", "cyan");

		process.exit();
	});
};
