import axios from 'axios'
import { GET_PROFILE, PROFILE_ERROR } from './types'
import { setAlert } from './alert'
 
//Get current users profile
export const getCurrentProfile = () => 
async dispatch => {
    try {
        const res = await axios.get('/api/profils/me')
        dispatch({
            type: GET_PROFILE, 
            payload: res.data,
        })
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR, 
            payload: { msg: error.response.statusText, status: error.response.status}
        })
    }
}

// Create or update profile
export const createProfile = (formData, history, edit = false) => async dispatch =>{
    try {
        const confi = {
            header: {
                'Contente-Type': 'application/json'
            }
        }
        const res = await axios.post('/api/profile', formData, config)
        dispatch({
            type: GET_PROFILE, 
            payload: res.data,
        })

        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

        if(!edit){
            history.push('/dashboard')
        }
    } catch (error) {
        const errors = error.response.data.errors

            if (errors){
                errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
            }
        dispatch({
            type: PROFILE_ERROR, 
            payload: { msg: error.response.statusText, status: error.response.status },
        })
    }
}