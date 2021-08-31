const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require('mysql')
const bcrypt = require('bcrypt');

const app = express()
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'study_room'
});

app.post('/teachers/details', (req, res) => {

    const name = req.body.name
    const email = req.body.email
    const organisation = req.body.organisation
    const main_subject = req.body.main_subjects
    const sub_subject = req.body.sub_subject
    const contact = req.body.contact

    const sqlQuery = "INSERT INTO teacher_details (name, email, organisation, main_subject, sub_subject, contact) VALUES (?,?,?,?,?,?)"

    db.query(sqlQuery, [name, email, organisation, main_subject, sub_subject, contact], (err, result) => {
        console.log(err)
        res.send({
            contact: contact
        })
    })

})

app.post('/teachers/give_assignment', (req, res) => {

    const teacher_id = req.body.teacher_id
    const title = req.body.title
    const instruction = req.body.instruction
    const grade = req.body.grade
    const points = req.body.points
    const topic = req.body.topic
    const due_date = req.body.due_date

    const sqlQuery = "INSERT INTO give_assignment (teacher_id, title, instruction, grade, points,topic, due_date) VALUES (?,?,?,?,?,?, ?)"

    db.query(sqlQuery, [teacher_id, title, instruction, grade, points, topic, due_date], (err, result) => {
        console.log(err)
        res.send(result)
    })

    // res.send(details)

})

// Create account api
app.post('/user/signup', (req, res) => {

    const username = req.body.username
    const email = req.body.email
    let password = req.body.password
    const student = req.body.student // if teacher then student == false
    const saltRounds = 10;
    password = bcrypt.hashSync(password, saltRounds);

    const sqlQuery = "INSERT INTO user (username, email, password, student) VALUES (?,?,?,?)"

    db.query(sqlQuery, [username, email, password, student], (err, result) => {
        console.log(err)
        res.send(result)
    })

    // res.send(details)

})

// login api
app.post('/user/login', (req, res) => {

    const email = req.body.email
    const password = req.body.password
    
    const sqlQuery = "SELECT password FROM user WHERE email=?;"


    db.query(sqlQuery, [email], (err, result) => {
        let connection = bcrypt.compareSync(password, result[0].password);
        if(connection){
            console.log("Logged in")
            res.send(result)
        }
        else{
            console.log("Please enter password again")
            res.send(err)
        }
    })

    // res.send(details)

})

app.get('/teacher/get_assignment_by_id', (req, res) => {
    const teacher_id = req.body.teacher_id

    const sqlQuery = "SELECT * FROM give_assignment WHERE teacher_id = ?"

    db.query(sqlQuery, [teacher_id], (err, result) => {
        res.send(result)
    })

})

app.post('/user/send_otp', (req, res) => {

    const contact = req.body.contact
    const role = req.body.role
    const otp = Math.floor((Math.random() * 100000) + 1)

    const sqlQuery = "INSERT INTO user_otp (contact, role, otp) VALUES (?,?,?)"

    db.query(sqlQuery, [contact, role, otp], (err, result) => {
        console.log(err)
        res.send(result)
    })

    // res.send(role, contact, otp)

})


app.post('/user/resend_otp', (req, res) => {

    const contact = req.body.contact
    const role = req.body.role
    const otp = Math.floor((Math.random() * 100000) + 1)

    const sqlQuery = "UPDATE user_otp SET otp = ? WHERE contact = ?"

    db.query(sqlQuery, [otp, contact], (err, result) => {
        console.log(err)
        res.send(result)
    })
    // res.send(role, contact, otp)
})

app.post('/user/verify', (req, res) => {
    const otp = req.body.otp
    const user_id = req.body.user_id
    const sqlQuery = "SELECT otp FROM user_otp WHERE otp = ? and user_id = ?"

    db.query(sqlQuery, [otp, user_id], (err, result) => {
        if (result.length !== 0) {
            res.send({
                status: true,
                message: "user verified"
            })
        }
        else {
            res.send({
                status: false,
                message: "wrong otp"
            })
        }
    })
})

function generateUID() {
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}

app.post('/teacher/create_class', (req, res) => {

    const teacher_id = req.body.teacher_id
    const class_code = generateUID()
    const grade = req.body.grade

    const sqlQuery = "INSERT INTO all_classes (teacher_id, class_code, grade) VALUES (?,?,?)"

    db.query(sqlQuery, [teacher_id, class_code, grade], (err, result) => {
        console.log(err)
        res.send(result)
    })
    // res.send(role, contact, otp)
})

app.post('/student/student_details', (req, res) => {
    const name = req.body.name
    const email = req.body.email
    
    const contact = req.body.contact
    const school = req.body.school
    const grade = req.body.grade

    const sqlQuery = "INSERT INTO student_details (name, email, contact, school, grade) VALUES (?,?,?,?,?)"

    db.query(sqlQuery, [name, email, contact, school, grade], (err, result) => {
        console.log(err)
        res.send(result)
    })
    
})

app.post('/student/join_class', (req, res) => {

    const student_id = req.body.student_id
    const teacher_id = req.body.teacher_id
    const class_code = req.body.class_code

    const sqlQuery = "INSERT INTO students_class (student_id, class_code, teacher_id) VALUES (?,?,?)"

    const sqlQuery2 = "SELECT no_of_students from all_classes WHERE class_code = ?"

    const sqlQuery3 = "UPDATE all_classes SET no_of_students = ? WHERE class_code = ?"

    const sqlQuery4 = " SELECT student_id, class_code FROM study_room.students_class where student_id = ? and class_code= ?"

    db.query(sqlQuery4, [student_id, class_code], (err, result1) => {

        if (result1.length >= 1) {
            res.status(404).send('already in this class')
        } else {
            db.query(sqlQuery2, [class_code], (err, result2) => {

                const student_count = result2[0].no_of_students + 1

                db.query(sqlQuery3, [student_count, class_code], (err, result3) => {
                    console.log(err)
                })

                db.query(sqlQuery, [student_id, class_code, teacher_id], (err, result4) => {
                    console.log(err)
                    res.send(result4)
                })
            })
        }
    })
    // res.send(role, contact, otp)
})

app.listen(8080, () => {
    console.log('server is up on port 8080')
})