function debounce(fn, wait) {
	let timer;
	let resolveList = [];

	return function (...arguments_) {
		return new Promise((resolve) => {
			clearTimeout(timer);

			timer = setTimeout(() => {
				timer = null;

				const result = fn.apply(this, arguments_);

				for (resolve of resolveList) {
					resolve(result);
				}

				resolveList = [];
			}, wait);

			resolveList.push(resolve);
		});
	};
}
