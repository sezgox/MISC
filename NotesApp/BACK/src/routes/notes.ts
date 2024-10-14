import { Router } from "express";
import { editNote, getNoteToEdit, getNotes, newNote, removeNote } from "../controllers/notes";
import { validateToken } from "../controllers/validate-token";

const router = Router();

router.get('/',validateToken, getNotes);
router.post('/add',validateToken, newNote);
router.get('/edit/:id',validateToken, getNoteToEdit);
router.put('/edit/:id',validateToken, editNote);
router.delete('/:id', validateToken, removeNote)

export default router;