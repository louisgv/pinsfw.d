const { main } = require("./core/main");

main({
	watchPath: "./",
	webSocketPort: 4444,
	staticPort: 9001,
	setRestStatus: () => null,
	setSocketStatus: () => null,
	setWatcherStatus: () => null,
});
