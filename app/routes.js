module.exports = function (app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    db.collection('rating').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user: req.user,
        messages: result
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/createAlbum', (req, res) => {
    console.log('********')
    db.collection('rating').insertOne({ album: req.body.album, artist: req.body.artist, rating: 0 }, (err, result) => {
      console.log(result)
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })

  app.put('/albums', (req, res) => {
    // If rating is provided, update the rating
    if (req.body.rating !== undefined) {
      db.collection('rating')
        .findOneAndUpdate({ album: req.body.album, artist: req.body.artist || '' }, {
          $set: {
            rating: req.body.rating
          }
        }, {
          sort: { _id: -1 },
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
    } else {
      // Legacy thumb up/down logic
      const thumb = Object.keys(req.body).includes('thumbUp') // .includes checks if thumbs up is in the array
      const thumbValue = thumb ?
        //checking if thumb is true or false. If true +1, if false -1
        req.body.thumbUp + 1 :
        req.body.thumbDown - 1;
      db.collection('rating')
        .findOneAndUpdate({ album: req.body.album, artist: req.body.artist }, {
          $set: {
            thumbUp: thumbValue
          }
        }, {
          sort: { _id: -1 },
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
    }
  })

  // app.delete('/messages', (req, res) => {
  //   db.collection('rating').findOneAndDelete({ album: req.body.album, artist: req.body.artist }, (err, result) => {
  //     if (err) return res.send(500, err)
  //     res.send('Message deleted!')
  //   })
  // })

  app.delete('/albums', (req, res) => {
  db.collection('rating').findOneAndDelete({ album: req.body.album, artist: req.body.artist }, (err, result) => {
    if (err) return res.status(500).send(err)
    res.send('Album deleted!')
  })
})

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}

/* completed with the help of claude sonnet */
