const kbn:any = {};
kbn.valueFormats = {};

kbn.bytesToSize = function(bytes) {
	console.log(bytes);
	let k = 1024, // or 1000
		sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], // sizes = ['Bytes', 'KB', 'MB',"GB", "TB", "PB", "EB", "ZB", "YB"],
		i;
	if (bytes < 0) i = Math.floor(Math.log(-bytes) / Math.log(k));
	if (bytes >= 0 && bytes < 1) {
		return {
			a: 0,
			b: "0 GB"
		};
	}
	if (bytes >= 1) {
		i = Math.floor(Math.log(bytes) / Math.log(k));
	}
	const gtZero = ((bytes / k ** i).toPrecision(3)) >= 0 ? ((bytes / k ** i).toPrecision(3)) : 0;
	return {
		a: (bytes).toPrecision(3),
		b: gtZero + " " + sizes[i]
	};
};

kbn.numGet = function(value, decimals) {
	let num = String(value);
	const leng = num.length;
	const decimalPos = num.indexOf(".");
	const precision = decimalPos === -1 ? 0 : leng - decimalPos - 1;
	if (precision > decimals) {
		num = num.substr(0, decimalPos + decimals + 1);
	}
	return num;
};

kbn.toFixed = function(value, decimals) { // decimals:刻度标签的小数位数
	if (value === null) {
		return "";
	}
	const factor = decimals ? 10 ** Math.max(0, decimals) : 1; // Math.pow(x,y)  x的y次幂
	let formatted = String(Math.round(value * factor) / factor); // Math.round()四舍五入为最接近的整数。
	// formatted = kbn.numGet(formatted,2);
	// if exponent return directly
	if (formatted.indexOf('e') !== -1 || value === 0) {
		return formatted;
	}

	// If tickDecimals was specified, ensure that we have exactly that
	// much precision; otherwise default to the value's own precision.
	if (decimals != null) {
		const decimalPos = formatted.indexOf("."); // 返回小数点首次出现的位置，没有出现即整数时则返回-1
		const precision = decimalPos === -1 ? 0 : formatted.length - decimalPos - 1;
		if (precision < decimals) {
			return (precision ? formatted : formatted + ".") + (String(factor)).substr(1, decimals - precision);
		}
	}
	formatted = kbn.numGet(formatted, 2);
	return formatted;
};

kbn.formatFuncCreator = function(factor, extArray) {
	return function(size, decimals, scaledDecimals) { // size:值；decimals:刻度标签的小数位数；scaleDecimals:
		if (size === null) {
			return "";
		}
		let steps = 0;
		const limit = extArray.length;

		while (Math.abs(size) >= factor) {
			steps++;
			size /= factor;

			if (steps >= limit) {
				return "NA";
			}
		}

		if (steps > 0 && scaledDecimals !== null) {
			decimals = scaledDecimals + (3 * steps);
		}
		return kbn.toFixed(size, decimals) + extArray[steps];
	};
}

kbn.valueFormats.bits = kbn.formatFuncCreator(1024, [' b', ' Kib', ' Mib', ' Gib', ' Tib', ' Pib', ' Eib', ' Zib', ' Yib']);
kbn.valueFormats.bytes = kbn.formatFuncCreator(1024, [' B', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']);
kbn.valueFormats.bytes_rate = kbn.formatFuncCreator(1024, [' B/s', ' KB/s', ' MB/s', ' GB/s', ' TB/s', ' PB/s', ' EB/s', ' ZB/s', ' YB/s']);
kbn.valueFormats.kbytes = kbn.formatFuncCreator(1024, [' KiB', ' MiB', ' GiB', ' TiB', ' PiB', ' EiB', ' ZiB', ' YiB']);
kbn.valueFormats.mbytes = kbn.formatFuncCreator(1024, [' MiB', ' GiB', ' TiB', ' PiB', ' EiB', ' ZiB', ' YiB']);
kbn.valueFormats.gbytes = kbn.formatFuncCreator(1024, [' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']);
kbn.valueFormats.bps = kbn.formatFuncCreator(1000, [' bps', ' Kbps', ' Mbps', ' Gbps', ' Tbps', ' Pbps', ' Ebps', ' Zbps', ' Ybps']);
kbn.valueFormats.pps = kbn.formatFuncCreator(1000, [' pps', ' Kpps', ' Mpps', ' Gpps', ' Tpps', ' Ppps', ' Epps', ' Zpps', ' Ypps']);
kbn.valueFormats.Bps = kbn.formatFuncCreator(1000, [' Bps', ' KBps', ' MBps', ' GBps', ' TBps', ' PBps', ' EBps', ' ZBps', ' YBps']);
kbn.valueFormats.ops = kbn.formatFuncCreator(1000, [' ops', ' kops', 'Mops', 'Gops', 'Tops', 'Pops', 'Eops', 'Zops', 'Yops']);
kbn.valueFormats.none = kbn.toFixed;
kbn.valueFormats.percent = function(size, decimals) {
	return kbn.toFixed(size, decimals) + ' %';
};
kbn.valueFormats.special = function(size, decimals, unit) {
	return kbn.toFixed(size, decimals) + " " + unit;
};

kbn.roundValue = function(num, decimals) {
	if (num === null) {
		return null;
	}
	const n = 10 ** decimals;
	return Math.round((n * num).toFixed(decimals)) / n;
};

export default kbn
