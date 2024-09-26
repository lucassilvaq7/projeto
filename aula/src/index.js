import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'

import {v4 as uuidv4} from 'uuid'

const app = express()

// app.use(cors())
// app.use(cors({
//     origin: ['http://example.com', 'http://seufrontend.com']
// }))

app.use(express.json())

app.get('/', (req, res) => {
    res.send('ola, express')
})

const users = [
    {
        id: 1,
        name: 'lucas',
        available: false
    },
    {
        id: 2,
        name: 'leo',
        available: true
    },
    {
        id: 3,
        name: 'maristela',
        available: true
    },
]

const adminUsers = []

// app.get('/users', (req, res) => {
//     if (users.length === 0) {
//         return res.status(404).json({
//             message: 'nenhum usuario encontrado.'
//         })
//     }

//     return res.json(users)
// })

app.post('/users', (req, res) => {
    const { name, available } = req.body

    if (!name) {
        return res.status(400).json({
            message: 'nome de usuario obrigatorio.'
        })
    }

    const newUser = {
        id: users.length + 1,
        name,
        available: available ?? true
    }

    users.push(newUser)

    return res.status(201).json({
        message: 'usuario adicionado com sucesso.',
        user: newUser
    })
})

app.put('/users/:id', (req, res) => {
    const { id } = req.params
    const { name, available } = req.body

    const user = users.find(user => user.id === parseInt(id))

    if (!user) {
        return res.status(404).json({
            message: 'usuario nao encotrado'
        })
    }

    user.name = name
    user.available = available

    return res.status(200).json({
        message: 'usuario atualizado com sucesso.',
        user
    })
})

app.get('/users', (req, res) => {
    const { filtro } = req.query

    let filteredUsers

    if (filtro === 'ativo') {
        filteredUsers = users.filter(user => user.available === true)
    } else if (filtro === 'inativo') {
        filteredUsers = users.filter(user => user.available === false)
    } else {
        filteredUsers = users
    }

    if (filteredUsers.length === 0) {
        return res.status(404).json({
            message: 'nenhum usuario encontrado.'
        })
    }

    return res.status(200).json({
        message: 'lista de usuarios',
        filteredUsers
    })
})

app.delete('/users/:id', (req, res) => {
    const { id } = req.params

    const userIndex = users.findIndex(user => user.id === parseInt(id))

    if (userIndex === -1) {
        return res.status(404).json({
            message: 'nenhum usuario encontrado.'
        })
    }

    // const deletedUser = users.splice(userIndex, 1)[0]
    const [deletedUser] = users.splice(userIndex, 1)

    return res.status(200).json({
        message: 'usuario deletado com sucesso.',
        deletedUser
    })
})

app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 10)

        const existingUser = adminUsers.find(user => user.username === username)

        if (existingUser) {
            return res.status(400).json({
                message: 'usuario ja existe.'
            })
        }

        const newAdminUser = {
            id: uuidv4(),
            username,
            password: hashedPassword
        }

        adminUsers.push(newAdminUser)

        return res.status(201).json({
            message: 'admin criado com sucesso.',
            newAdminUser
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao registrar admin',
            error
        })
    }
})

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body

        const user = adminUsers.find(user => user.username === username)
        if (!user) {
            return res.status(404).json({
                message: 'admin nao encontrado.'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch){
            return res.status(400).json({
                message: 'usuario ou senha incorretos.'
            })
        }

        return res.status(200).json({
            message: 'login efetuado com sucesso.'
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao registrar admin',
            error
        })
    }
})

app.listen(3000, () => {
    console.log('server rodando na porta 3000')
})