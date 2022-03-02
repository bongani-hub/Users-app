import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import User from './models/user.model.js';
import jwt from 'jsonwebtoken';

const app = express()

app.use(cors()); 
app.use(express.json())

const PORT  = process.env.PORT || 4000;
const CONNECTION_URL = 'mongodb+srv://minutes:lebza1632@cluster2.rgm6j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true})


app.post('/api/register', async (req, res) => {
	console.log(req.body)
	try {
		const newPassword = await bcrypt.hash(req.body.password, 10)
		await User.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
		})
		res.json({ status: 'ok' })
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})
app.post('/api/login', async (req, res) => {
	const user = await User.findOne({
		email: req.body.email,
	})

	if (!user) {
		return { status: 'error', error: 'Invalid login' }
	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				name: user.name,
				email: user.email,
			},
			'secret2022'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})

app.get('/api/quote', async(req, res)=>{
    
    const token =req.headers['x-access;token']
    
    try{
        const decoded = jwt.verify(token, 'secret2022')
        const email = decoded.email
        const user = await User.findOne({email: email})
        return res.json( { status: 'ok', quote: user.quote})
    }catch(error){
        console.log(error)
        res.json({status: 'error', eeror: 'invalid token'})
    }
})
app.post('/api/quote', async(req, res)=>{
    
    const token =req.headers['x-access;token']
    
    try{
        const decoded = jwt.verify(token, 'secret2022')
        const email = decoded.email
        await User.updatedOne({email: email}, {$set: { quote: req.body.quote}})
        return res.json({ status: 'ok'})
    }catch(error){
        console.log(error)
        res.json({status: 'error', eeror: 'invalid token'})
    }
})


app.listen(4000,()=>{
    console.log(  `server running on :  http://localhost: ${PORT}`);
})