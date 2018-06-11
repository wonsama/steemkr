const minimist = require('minimist');	// 외부 파라미터를 자동으로 파싱하여 분류해준다.
const help = require('./cmd/help');
const error = require('./util/error');

// 환경 변수값을 로딩한다 
require("dotenv").config();

module.exports = () => {
	const args = minimist(process.argv.slice(2));
	const cmd = args._[0];
	const params = args._.slice(1);
	const param = params&&params.length>=0?params[0]:undefined;

	switch(cmd){
		case 'help':
			require('./cmd/help')(param);
		break;
		case 'config':
			require('./cmd/config')(params);				
		break;
		case 'price':
			require('./cmd/price')(params);
		break;
		case 'version':
			require('./cmd/version')(params);
		break;
		case 'accounts':
			require('./cmd/accounts')(params);
		break;
		case undefined:
			error(`\n    하위 명령어가 존재하지 않습니다. 아래 메뉴얼을 참조 바랍니다.`, false);
			help();
		break;
		default:
			error(`"${cmd}" 은 유효한 명령어가 아닙니다 !`, true);
		break;
	}
}