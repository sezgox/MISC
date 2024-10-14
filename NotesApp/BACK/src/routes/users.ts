import { Router } from "express";
import { checkUsername, getProfileInfo, myEditProfile, updateProfile } from "../controllers/profile";
import { login, register } from "../controllers/users";
import { isAuth, validateToken } from "../controllers/validate-token";

const router = Router();

router.get('/', checkUsername);
router.get('/auth', isAuth);

router.post('/register', register);
router.post('/login', login);

router.get('/profile/:username',validateToken, getProfileInfo);
router.get('/profile/:username/edit', validateToken, myEditProfile);
router.put('/profile/:username/edit', validateToken, updateProfile);


export default router;