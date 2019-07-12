var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /users/lookup/{username} User Lookup
  * @apiName LookupUser
  * @apiPermission User
  * @apiDescription Query possible username matches and returns their ids for use in UI components
  *
  * @apiParam {string} username The name of the user to send the message to
  * @apiParam {boolean} self Include authed user in lookup
  *
  * @apiSuccess {object[]} users An array of possible username matches
  * @apiSuccess {string} users.id The id of the user
  * @apiSuccess {string} users.username The username of th user
  *
  * @apiError (Error 500) InternalServerError There was an issue looking up usernames
  */
module.exports = {
  method: 'GET',
  path: '/api/users/lookup/{username}',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: {
        username: Joi.string().required(),
        self: Joi.boolean()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.users.lookup(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    // get id for username
    var username = request.params.username;
    var ignoredUsername = request.query.self ? undefined : request.auth.credentials.username;
    var promise = request.db.users.lookup(username, ignoredUsername)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
