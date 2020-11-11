import React, { useEffect } from "react";
import PropTypes from "prop-types";

import { Text, Color, Box } from "ink";

import { useLogState } from "../core/utils";
import {
	webSocketPort as initWebSocketPort,
	staticPort as initStaticPort,
} from "../core/config";

// import os from "os";
// import { spawn } from "node-pty";

// const shellCmd = os.platform() === "win32" ? "powershell.exe" : "bash";

// const shell = spawn(shellCmd, [], {
// 	name: "xterm-color",
// 	cwd: process.env.PWD,
// 	env: process.env,
// 	encoding: null
// });

/// 🚀 Instant file watcher socket daemon for armhf.
const Main = ({ path: watchPath, webSocketPort, staticPort }) => {
	const [restStatus, restStatusColor, setRestStatus] = useLogState(
		"rest",
		"🔄\tSpinning up file server . . .",
		"yellow"
	);

	const [socketStatus, socketStatusColor, setSocketStatus] = useLogState(
		"socket",
		"🔄\tSpinning up socket server . . .",
		"yellow"
	);

	const [watcherStatus, watcherStatusColor, setWatcherStatus] = useLogState(
		"watcher",
		"🔄\tPrepare watch path . . .",
		"yellow"
	);

	useEffect(
		() =>
			main({
				watchPath,
				webSocketPort,
				staticPort,
				setRestStatus,
				setSocketStatus,
				setWatcherStatus,
			}),
		[]
	);

	return (
		<Box flexDirection="column">
			<Color keyword={socketStatusColor}>
				<Text>{socketStatus}</Text>;
			</Color>
			<Color keyword={restStatusColor}>
				<Text>{restStatus}</Text>;
			</Color>
			<Color keyword={watcherStatusColor}>
				<Text>{watcherStatus}</Text>;
			</Color>
		</Box>
	);
};

Main.propTypes = {
	/// Relative path to the watching directory
	path: PropTypes.string,
	/// Websocket port
	webSocketPort: PropTypes.number,
	/// Static file port
	staticPort: PropTypes.number,
};

Main.defaultProps = {
	path: ".",
	webSocketPort: initWebSocketPort,
	staticPort: initStaticPort,
};

Main.shortFlags = {
	path: "p",
	webSocketPort: "wp",
	staticPort: "sp",
};
export default Main;
