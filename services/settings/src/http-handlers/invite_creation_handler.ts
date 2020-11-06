import {Request, Response, Router} from 'express'
import {getReportReasons} from '../mysql/mysql'

const inviteManagementInterface = Router();

async function getAllInvitations() {

}

inviteManagementInterface.get("/", getAllInvitations);

export default inviteManagementInterface