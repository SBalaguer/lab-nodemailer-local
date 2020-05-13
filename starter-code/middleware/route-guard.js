// Route Guard Middleware
// This piece of middleware is going to check if a user is authenticated
// If not, it sends the request to the custom error handler with a message
module.exports = (req, res, next) => {
  console.log(req.user, req.session, req.cookies);
  // console.log('Im the routegard and I managed to ran!')
  if (req.user) {
    // console.log("ROUTE  confirmed")
    next();
  } else {
    // console.log("ROUTE GUARD")
    next(new Error('User has no permission to visit that page.'));
  }
};
