//requirements
const express=require('express');
const mongoose=require('mongoose');
const morgan=require('morgan');
const Exercise=require('./models/exercise.js');

const app=express();
var today=new Date();
app.locals.currentDate=today.getFullYear()+'-';
if(today.getMonth()+1<10){
    app.locals.currentDate+="0";
}
app.locals.currentDate+=(today.getMonth() + 1)+'-'+today.getDate();
var errorBool=false;
//connect to database
const mongDB="mongodb+srv://joe:NilX6AUCJoUgmVZQ@cluster0.dmcc2.mongodb.net/node-exercise?retryWrites=true&w=majority";
mongoose.connect(mongDB,{useNewUrlParser : true, useUnifiedTopology: true})
.then((result)=>{
    mongoose.set('useFindAndModify', false);
    app.listen(3000);
    console.log("Connected to localhost");
}).catch(err=>{
    console.log(err);
})

app.set('view engine' , 'ejs');
app.use(express.static(__dirname+'/public'));
//Enable JSON-like objects
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//comment stats
app.use(morgan('dev'));
app.get('/create',(req,res)=>{
    if(errorBool){
        errorBool=!errorBool;
        res.render('create.ejs',{title: 'New Entry', err1 : true});
    }else{
        res.render('create.ejs',{title: 'New Entry', err1 : false});
    }
});
app.get('/',(req,res)=>{
    res.redirect('/home');
})
app.get('/addworkout',(req,res)=>{
    res.render('workout.ejs', {title : 'New Workout', currentDate : app.locals.currentDate});
})
app.get('/addmeal',(req,res)=>{
    res.render('meal.ejs', {title: 'New Meal', currentDate: app.locals.currentDate});
})
app.get('/home/:date',(req,res)=>{
    const temp=req.params.date;
    console.log('recieved request');
    Exercise.exists({date : temp})
    .then((result)=>{
        if(result){
            Exercise.findOne({date:temp})
            .then((result2)=>{
                app.locals.currentDate=result2.date;
                res.json({redirect:'home'});
            })
            .catch(err=>{
                console.log(err);
            })
        }else{
            app.locals.currentDate=temp;
            res.json({redirect:'home'});
        }
    })
})
app.put('/home2', (req,res)=>{
    console.log('made request for meal');
    if(req.body.length){
        Exercise.findOneAndUpdate({date : app.locals.currentDate}, {$push:{meal : req.body}})
        .then(result=>{
            console.log('here');
        }).catch(err=>{
            console.log(err);
        })
    }
    res.json({redirect : '/home'});
})
app.put('/home', (req,res)=>{
    if(req.body.length){
        Exercise.findOneAndUpdate({date : app.locals.currentDate}, {$push:{exercise : req.body}})
        .then(result=>{
            console.log('here');
        }).catch(err=>{
            console.log(err);
        })
        
    }
    res.json({redirect : '/home'});
})
app.post('/home',(req,res)=>{
    const temp=new Exercise(req.body);
    Exercise.exists({date : temp.date})
    .then((result)=>{
            if(!result){
                console.log('new');
                temp.save().then((result)=>{
                    app.locals.currentDate=temp.date;
                    res.redirect('/home');
                    console.log("Entry successfully created");
                }).catch(err=>{
                    console.log(err);
                });
            }else{
                errorBool=true;
                res.redirect('/create');
            }
        
    }).catch(err=>{
        console.log(err);
    })
});
app.get('/home',(req,res)=>{
    if(req.body.length>0){
        app.locals.currentDate=req.body.toString();
    }
    Exercise.exists({date : app.locals.currentDate})
    .then((result)=>{
        if(result){
            Exercise.findOne({date : app.locals.currentDate}, (err, exercise)=>{
                res.render('index', {entry : exercise, title: 'Home', currentDate : app.locals.currentDate});
            })
            
        }else{
            res.render('index', {entry : [], title: 'Home', currentDate : app.locals.currentDate});
        }
    })
})
app.get('/about',(req,res)=>{
    res.render('about.ejs',{title: 'About'})
});
app.use((req,res)=>{
    res.status(404).render('404.ejs', {title: "404 Page"});
})