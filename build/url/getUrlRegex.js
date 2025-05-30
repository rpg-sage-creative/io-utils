import { getOrCreateRegex } from "@rsc-utils/core-utils";
import { regex } from "regex";
function createUrlRegex(options) {
    const { gFlag = "", iFlag = "" } = options ?? {};
    const flags = gFlag + iFlag;
    return regex(flags) `
		# protocol
		(s?ftp|https?)://

		# auth
		(\S+(:\S*)?@)?

		# hostname
		(
			# first sub can have - or underscore, but cannot end in one
			(([0-9a-z\u00a1-\uffff][\-_]*)*[0-9a-z\u00a1-\uffff]+\.)

			# domain can have dashes, but cannot end in one
			(([0-9a-z\u00a1-\uffff]-*)*[0-9a-z\u00a1-\uffff]+\.)*

			# alpha only tld
			([a-z\u00a1-\uffff]{2,})

			|
			# ipv4
			(\d{1,3}\.){3}\d{1,3}

			|
			localhost
		)

		# port
		(:\d{2,5})?

		# path
		(/[%.~+\-\w]*)*

		# querystring
		(\?[;&=%.~+\-\w]*)?

		# anchor
		(\#[\-\w]*)?
	`;
}
export function getUrlRegex(options) {
    return getOrCreateRegex(createUrlRegex, options);
}
