import masterData from './master.json';

const firstName = masterData.personal.firstName;
const lastName = masterData.personal.lastName;
const suffix = masterData.personal.suffix;

const BaseData = {
	firstName,
	lastName,
	suffix,
	get fullName() {
		return `${firstName} ${lastName}`;
	}
};

export default BaseData;
