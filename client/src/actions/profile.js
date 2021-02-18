import axios from 'axios'
import { setAlert } from './alert'

import { GET_PROFILE, PROFILE_ERROR } from './types'

//Get current users profile
export const getCurrentProfile = () => 
async dispatch => {
    try {
        const res = await axios.get('/api/profile/me')
        dispatch({
            type: GET_PROFILE, 
            payload: res.data,
        })
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR, 
            payload: { msg: error.response.statusText, status: error.response.status}
        })
<<<<<<< HEAD
}
=======
>>>>>>> dc4d92f652fd61ead67ec0281dcf07f47aa121f5
}