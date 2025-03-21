{\rtf1\ansi\ansicpg1252\cocoartf2821
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import express from 'express';\
import cors from 'cors';\
import pg from 'pg';\
import dotenv from 'dotenv';\
import jwt from 'jsonwebtoken';\
import bcrypt from 'bcrypt';\
\
dotenv.config();\
\
const app = express();\
const PORT = process.env.PORT || 5000;\
\
app.use(cors());\
app.use(express.json());\
\
const pool = new pg.Pool(\{\
  connectionString: process.env.DATABASE_URL,\
  ssl: \{\
    rejectUnauthorized: false\
  \}\
\});\
\
// Basic test route\
app.get('/', (req, res) => \{\
  res.send('Skeduel Backend is Running!');\
\});\
\
// Signup\
app.post('/signup', async (req, res) => \{\
  const \{ username, email, password \} = req.body;\
  try \{\
    const hashedPassword = await bcrypt.hash(password, 10);\
    const result = await pool.query(\
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',\
      [username, email, hashedPassword]\
    );\
    res.status(201).json(result.rows[0]);\
  \} catch (err) \{\
    res.status(500).json(\{ error: 'Error creating user', details: err.message \});\
  \}\
\});\
\
// Login\
app.post('/login', async (req, res) => \{\
  const \{ email, password \} = req.body;\
  try \{\
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);\
    if (result.rows.length === 0) return res.status(400).json(\{ error: 'User not found' \});\
\
    const user = result.rows[0];\
    const isMatch = await bcrypt.compare(password, user.password);\
    if (!isMatch) return res.status(400).json(\{ error: 'Invalid credentials' \});\
\
    const token = jwt.sign(\{ userId: user.id \}, process.env.JWT_SECRET, \{ expiresIn: '1h' \});\
    res.json(\{ token, user: \{ id: user.id, username: user.username, email: user.email \} \});\
  \} catch (err) \{\
    res.status(500).json(\{ error: 'Login error', details: err.message \});\
  \}\
\});\
\
app.listen(PORT, () => console.log(`Server running on port $\{PORT\}`));}