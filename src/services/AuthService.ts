import axios from '../api/axios';
export class LoginService {
  static sendVerifyCodeByEmail(email: string) {
    return axios.get(`/api/login/getVerificationCode/${email}`);
  }
  static loginVerify(params: { userName: string; verificationCode: string }) {
    return axios.post(`/api/verify`, params);
  }
}