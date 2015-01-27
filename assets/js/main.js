$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  options.url = 'http://backbonejs-beginner.herokuapp.com' + options.url;
});

$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};
/**
 * Modal
 * @type {[type]}
 */
var Users = Backbone.Collection.extend({
  url: '/users'
});

var User = Backbone.Model.extend({
  urlRoot: '/users'
})

/**
 * view
 * @param  {[element]} ) {		var       that [description]
 * @return {[type]}   [description]
 */
var UserList = Backbone.View.extend({
  el: '.page',
  render: function() {
    var that = this;
    var users = new Users();
    users.fetch({
      success: function(users) {
        var template = _.template($('#user-list-template').html(), {
          users: users.models
        });
        that.$el.html(template);
      }
    })
  }
});

var EditUser = Backbone.View.extend({
  el: '.page',
  render: function (options) {
    var that = this;
    if(options.id){
      that.user = new User({id : options.id});
      that.user.fetch({
        success: function (){
          var template = _.template($('#edit-user-template').html(), {user: that.user});
          that.$el.html(template);
        }
      })
    } else {
      var template = _.template($('#edit-user-template').html(), {user: null});
      this.$el.html(template);  
    }

    
  },
  events: {
    'submit .edit-user-form': 'saveUser',
    'click button.delete' : 'deleteUser'
  },
  saveUser: function (ev) {
  	ev.preventDefault();
    // alert("in edit");
    var userDetails = $(ev.currentTarget).serializeObject();

    var user = new User();
    user.save(userDetails, {
    	success: function (user) {
    		console.log(user);
    		router.navigate('', {trigger: true})
    	}
    })
    // console.log(userDetails); 
    return false;
  },
  deleteUser: function (){
    // alert("in delete");
    this.user.destroy({ 
      success: function (){
        router.navigate('', {trigger: true})
      }
    })
    return false;
  }
});
/**
 * [Router description]
 * @type {[type]}
 */
var Router = Backbone.Router.extend({
  routes: {
    '': 'home',
    'new': 'editUser',
    'edit/:id' : 'editUser'
  }
});

var userList = new UserList();
var editList = new EditUser();

var router = new Router();

router.on('route:home', function() {
  // console.log("we have logged the home page");
  userList.render();
});

router.on('route:editUser', function (id) {
  // console.log("this is edit user");
  editList.render({ id: id});
});

Backbone.history.start();
