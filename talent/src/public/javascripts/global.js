// pagination state
var globalItemsOnPage = 8;
var usersCurrentPage = 1;
var usersItemCount = 0;
var candidatesCurrentPage = 1;
var candidatesItemCount = 0;
var curves;
var curveCount = 0;
var usersCurrent;
var usersActive;
var events;
var eventsActive;

$(document).ready(function() {

  // load selects
  loadOptions();

  // populate tables on page load
  reloadUsers();
  reloadCandidates();

  // attach even handlers
  $('#btn-logout').on('click', logout);

  // for users
  $('#btn-add-user').on('click', addUser);
  $('#btn-save-user').on('click', saveUser);
  $('#btn-search-user').on('click', reloadUsers);
  $('#user-list table tbody').on('click', 'td a.link-edit-user', editUser);
  $('#user-list table tbody').on('click', 'td a.link-delete-user', deleteUser);
  $('#pag-users').on('select.uk.pagination', pageUsers);

  // for candidates
  $('#btn-add-candidate').on('click', addCandidate);
  $('#btn-save-candidate').on('click', saveCandidate);
  $('#btn-search-candidate').on('click', reloadCandidates);
  $('#candidate-list table tbody').on('click', 'td a.link-analyze-curve', analyzeCurve);
  $('#candidate-list table tbody').on('click', 'td a.link-edit-candidate', editCandidate);
  $('#candidate-list table tbody').on('click', 'td a.link-delete-candidate', deleteCandidate);
  $('#candidate-list table tbody').on('click', 'td a.link-archive-candidate', archiveCandidate);
  $('#candidate-list table tbody').on('click', 'td a.link-edit-curve', editCurve);
  $('#pag-candidates').on('select.uk.pagination', pageCandidates);
  $('#btn-save-curve').on('click', saveCurve);
  $('#btn-cancel-curve').on('click', cancelCurve);
  $('#btn-delete-curve').on('click', deleteCurve);
  $('#btn-back-curve').on('click', backCurve);
  $('#btn-new-curve').on('click', newCurve);
  $('#btn-forward-curve').on('click', forwardCurve);
  $('#analyze-curve-users').on('click', 'button', selectCurveUsers);
});

function loadOptions() {
  $.getJSON(apiServer + '/api/sources', function(data) {
    $("#add-candidate-source option").remove(); // Remove all <option> child tags.
    $("#edit-candidate-source option").remove(); // Remove all <option> child tags.
    $('<option selected disabled/>').val('').text('Source').appendTo($('#add-candidate-source'));
    $('<option selected disabled/>').val('').text('Source').appendTo($('#edit-candidate-source'));
    $.each(data.sources, function(index, item) { // Iterates through a collection
      $('<option/>').val(item.value).text(item.value).appendTo($('#add-candidate-source'));
      $('<option/>').val(item.value).text(item.value).appendTo($('#edit-candidate-source'));
    });
  });

  $.getJSON(apiServer + '/api/statuses', function(data) {
    $("#edit-candidate-status option").remove(); // Remove all <option> child tags.
    $('<option selected disabled/>').val('').text('Status').appendTo($('#edit-candidate-status'));
    $.each(data.statuses, function(index, item) { // Iterates through a collection
      $('<option/>').val(item.value).text(item.value).appendTo($('#edit-candidate-status'));
    });
  });

  $.getJSON(apiServer + '/api/roles', function(data) {
    $("#add-user-group option").remove(); // Remove all <option> child tags.
    $("#edit-user-group option").remove(); // Remove all <option> child tags.
    $('<option selected disabled/>').val('').text('Role').appendTo($('#add-user-group'));
    $('<option selected disabled/>').val('').text('Role').appendTo($('#edit-user-group'));
    $.each(data.roles, function(index, item) { // Iterates through a collection
      $('<option/>').val(item.value).text(item.value).appendTo($('#add-user-group'));
      $('<option/>').val(item.value).text(item.value).appendTo($('#edit-user-group'));
    });
  });

  $.getJSON(apiServer + '/api/events', function(data) {
    $("#rate-event option").remove(); // Remove all <option> child tags.
    $('<option selected disabled/>').val('').text('Event').appendTo($('#rate-event'));
    $.each(data.events, function(index, item) { // Iterates through a collection
      $('<option/>').val(item.value).text(item.value).appendTo($('#rate-event'));
    });
  });
}

function logout(event) {
  event.preventDefault();

  // try to remove current user token
  $.ajax({
    type: 'GET',
    url: '/logout',
    headers: {
      "Authorization":"Token " + token
    }
  }).done(function(data, textStatus, jqXHR) {
    // hopefully it worked, but if not the token will expire
  });

  // reload
  window.location.href = "/";
}

// -------------------------------------------------------------------
// ---------------------------- Candidate ----------------------------
// -------------------------------------------------------------------

function addCandidate(event) {

  event.preventDefault();

  // basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#add-candidate input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });
  $('#add-candidate select').each(function(index, val) {
    if(!$(this).val()) { errorCount++; }
  });

  if(errorCount === 0) {

    // create new candidate object
    var newCandidate = {
      'name': $('#add-candidate input#add-candidate-name').val(),
      'role': $('#add-candidate input#add-candidate-role').val(),
      'source': $('#add-candidate select#add-candidate-source').val()
    }

    // ...and save it
    $.ajax({
      type: 'POST',
      data: newCandidate,
      url: apiServer + '/api/candidates',
      headers: {
        "Authorization":"Token " + token
      }
    }).done(function(data, textStatus, jqXHR) {

      // check for success
      if (jqXHR.status == 201) {

        // clear form fields
        // TODO - select fields are not cleared
        $('#add-candidate input').val('');

        // populate candidates
        loadCandidates();

      } else {

        // if something goes wrong, alert the error message that our service returned
        alert('Error: ' + data.message);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {

      if (jqXHR.status == 401) {
        window.location.href = "/";
      } else {
        var error = $.parseJSON(jqXHR.responseText);
        alert(error.message);
      }
    });

  } else {

    // if errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};

function deleteCandidate(event) {

  event.preventDefault();

  // pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this candidate?');

  // did user confirm
  if (confirmation === true) {

    // ...if so, delete
    $.ajax({
      type: 'DELETE',
      url: apiServer + '/api/candidates/' + $(this).attr('rel'),
      headers: {
        "Authorization":"Token " + token
      }
    }).done(function(data, textStatus, jqXHR) {

      // check for success
      if (jqXHR.status != 200) {
        alert('Error: ' + data.message);
      }

      // populate candidates
      reloadCandidates();

    }).fail(function(jqXHR, textStatus, errorThrown) {

      if (jqXHR.status == 401) {
        window.location.href = "/";
      } else {
        var error = $.parseJSON(jqXHR.responseText);
        alert(error.message);
      }
    });

  } else {

    // if cancelled, do nothing
    return false;
  }
};

function archiveCandidate(event) {

  event.preventDefault();

  // pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to archive this candidate?');

  // did user confirm
  if (confirmation === true) {

    // ...if so, delete
    $.ajax({
      type: 'PATCH',
      url: apiServer + '/api/candidates/' + $(this).attr('rel') + '/archive',
      headers: {
        "Authorization":"Token " + token
      }
    }).done(function(data, textStatus, jqXHR) {

      // check for success
      if (jqXHR.status != 200) {
        alert('Error: ' + data.message);
      }

      // populate candidates
      loadCandidates();

    }).fail(function(jqXHR, textStatus, errorThrown) {

      if (jqXHR.status == 401) {
        window.location.href = "/";
      } else {
        var error = $.parseJSON(jqXHR.responseText);
        alert(error.message);
      }
    });

  } else {

    // if cancelled, do nothing
    return false;
  }
};

function editCandidate(event) {

  event.preventDefault();

  // retrieve candidate id from link rel attribute
  var thisId = $(this).attr('rel');

  // ...and load it from the database
  $.ajax({
    type: 'GET',
    url: apiServer + '/api/candidates/' + $(this).attr('rel'),
    headers: {
      "Authorization":"Token " + token
    }
  }).done(function(data, textStatus, jqXHR) {

    // check for success
    if (jqXHR.status == 200) {

      // display modal dialog
      var modal = $.UIkit.modal("#edit-candidate");
      if (!modal.isActive()) {
        modal.show();
      }

      // ...and load values
      $('#edit-candidate-name').val(data.name);
      $('#edit-candidate-role').val(data.role);
      $('#edit-candidate-source').val(data.source);
      $('#edit-candidate-status').val(data.status);
      $('#edit-candidate-id').val(data._id);

    } else {

      // display service error
      alert('Error: ' + data.message);
    }

  }).fail(function(jqXHR, textStatus, errorThrown) {

    if (jqXHR.status == 401) {
      window.location.href = "/";
    } else {
      var error = $.parseJSON(jqXHR.responseText);
      alert(error.message);
    }
  });
}

function saveCandidate(event) {

  event.preventDefault();

  // basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#edit-candidate input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });
  $('#edit-candidate select').each(function(index, val) {
    if(!$(this).val()) { errorCount++; }
  });

  if(errorCount === 0) {

    // create new candidate object
    var thisId = $('#edit-candidate input#edit-candidate-id').val();
    var editCandidate = {
      '_id': thisId,
      'name': $('#edit-candidate input#edit-candidate-name').val(),
      'role': $('#edit-candidate input#edit-candidate-role').val(),
      'source': $('#edit-candidate select#edit-candidate-source').val(),
      'status': $('#edit-candidate select#edit-candidate-status').val()
    }

    // ...and save it
    $.ajax({
      type: 'PUT',
      data: editCandidate,
      url: apiServer + '/api/candidates/' + thisId,
      headers: {
        "Authorization":"Token " + token
      }
    }).done(function(data, textStatus, jqXHR) {

      // check for success
      if (jqXHR.status == 200) {

        // populate candidates
        loadCandidates();

      } else {

        // display service error
        alert('Error: ' + data.message);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {

      if (jqXHR.status == 401) {
        window.location.href = "/";
      } else {
        var error = $.parseJSON(jqXHR.responseText);
        alert(error.message);
      }
    });

    // hide dialog
    var modal = $.UIkit.modal("#edit-candidate");
    if (modal.isActive()) modal.hide();

  } else {

    // if errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};

function pageCandidates(event, pageIndex) {

  event.preventDefault();

  // set current page for the service call
  candidatesCurrentPage = pageIndex + 1;

  // populate candidates
  _getCandidates(false);
};

function reloadCandidates() {

  event.preventDefault();

  // reset current page
  candidatesCurrentPage = 1;

  // populate candidates
  _getCandidates(true);
}

function loadCandidates() {

  event.preventDefault();

  // populate candidates
  _getCandidates(false);
}

function _getCandidates(resetPagination) {

  // empty content string
  var tableContent = '';

  // calculate offset for the service call
  var offset = (candidatesCurrentPage - 1) * globalItemsOnPage;

  // get name filter text
  var filter = $('input#search-candidate-name').val();

  // get candidates
  $.ajax({
    type: 'GET',
    url: apiServer + '/api/candidates?offset=' + offset + '&limit=' + globalItemsOnPage + '&name=' + filter,
    headers: {
      "Authorization":"Token " + token
    }
  }).done(function(data, textStatus, jqXHR) {

    // check for success
    if (jqXHR.status == 200) {

      // for each item in returned JSON, add a table row and cells to the content string
      $.each(data.candidates, function() {
        tableContent += '<tr>';
        tableContent += '<td><a href="#" class="link-analyze-curve" rel="' + this._id + '">' + this.name + '</a></td>';
        tableContent += '<td class="uk-hidden-small">' + this.role + '</td>';
        tableContent += '<td class="uk-hidden-small">' + this.source + '</td>';
        tableContent += '<td>' + this.status + '</td>';
        tableContent += '<td class="uk-hidden-small">' + this.added.substring(0, 10) + '</td>';
        tableContent += '<td class="uk-hidden-small">' + this.updated.substring(0, 10) + '</td>';
        tableContent += '<td>';
        tableContent += '<a href="#" class="link-edit-curve uk-icon-bar-chart" rel="' + this._id + '"> <span class="uk-hidden-small">Rate<span></a>';
        tableContent += ' | <a href="#" class="link-edit-candidate uk-icon-edit" rel="' + this._id + '"> <span class="uk-hidden-small">Edit</span></a>';
        //tableContent += ' | <a href="#" class="link-delete-candidate uk-icon-remove" rel="' + this._id + '"> <span class="uk-hidden-small">Delete</span></a>';
        if (!this.archived) {
          tableContent += ' | <a href="#" class="link-archive-candidate uk-icon-archive" rel="' + this._id + '"> <span class="uk-hidden-small">Archive</span></a>';
        }
        tableContent += '</td>';
        tableContent += '</tr>';
      });

      // inject the whole content string into existing HTML table
      $('#candidate-list table tbody').html(tableContent);

      // save candidates count
      candidatesItemCount = data.count;

      // display pagination
      var pagination = $.UIkit.pagination('#pag-candidates', { items:candidatesItemCount, itemsOnPage:globalItemsOnPage, currentPage:candidatesCurrentPage });

      // if count changed pagination needs to be reinitialized
      if (resetPagination) {

        // items and current page have to be manually set
        pagination.options.items = candidatesItemCount;
        pagination.options.currentPage = candidatesCurrentPage;
        pagination.init();
      }

    } else {

      // display service error
      alert('Error: ' + data.message);
    }

  }).fail(function(jqXHR, textStatus, errorThrown) {

    if (jqXHR.status == 401) {
      window.location.href = "/";
    } else {
      var error = $.parseJSON(jqXHR.responseText);
      alert(error.message);
    }
  });
};

// -------------------------------------------------------------------
// ------------------------------ User ------------------------------
// -------------------------------------------------------------------

function addUser(event) {

  event.preventDefault();

  // basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#add-user input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });
  $('#add-user select').each(function(index, val) {
    if(!$(this).val()) { errorCount++; }
  });

  if(errorCount === 0) {

    // create new user object
    var newUser = {
      'username': $('#add-user input#add-user-username').val(),
      'password': $('#add-user input#add-user-password').val(),
      'name': $('#add-user input#add-user-name').val(),
      'department': $('#add-user input#add-user-department').val(),
      'group': $('#add-user select#add-user-group').val()
    }

    // ...and save it
    $.ajax({
      type: 'POST',
      data: newUser,
      url: apiServer + '/api/users',
      headers: {
        "Authorization":"Token " + token
      }
    }).done(function(data, textStatus, jqXHR) {

      // check for success
      if (jqXHR.status == 201) {

        // clear form fields
        // TODO - select fields are not cleared
        $('#add-user input').val('');

        // populate users
        loadUsers();

      } else {

        // if something goes wrong, alert the error message that our service returned
        alert('Error: ' + data.message);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {

      if (jqXHR.status == 401) {
        window.location.href = "/";
      } else {
        var error = $.parseJSON(jqXHR.responseText);
        alert(error.message);
      }
    });

  } else {

    // if errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};

function deleteUser(event) {

  event.preventDefault();

  // pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this user?');

  // did user confirm
  if (confirmation === true) {

    // ...if so, delete
    $.ajax({
      type: 'DELETE',
      url: apiServer + '/api/users/' + $(this).attr('rel'),
      headers: {
        "Authorization":"Token " + token
      }
    }).done(function(data, textStatus, jqXHR) {

      // check for success
      if (jqXHR.status != 200) {
        alert('Error: ' + data.message);
      }

      // populate users
      reloadUsers();

    }).fail(function(jqXHR, textStatus, errorThrown) {

      if (jqXHR.status == 401) {
        window.location.href = "/";
      } else {
        var error = $.parseJSON(jqXHR.responseText);
        alert(error.message);
      }
    });

  } else {

    // if cancelled, do nothing
    return false;
  }
};

function editUser(event) {

  event.preventDefault();

  // retrieve user id from link rel attribute
  var thisId = $(this).attr('rel');

  // ...and load it from the database
  $.ajax({
    type: 'GET',
    url: apiServer + '/api/users/' + $(this).attr('rel'),
    headers: {
      "Authorization":"Token " + token
    }
  }).done(function(data, textStatus, jqXHR) {

    // check for success
    if (jqXHR.status == 200) {

      // display modal dialog
      var modal = $.UIkit.modal("#edit-user");
      if (!modal.isActive()) {
        modal.show();
      }

      // ...and load values
      $('#edit-user-username').val(data.username);
      $('#edit-user-password').val('');
      $('#edit-user-name').val(data.name);
      $('#edit-user-department').val(data.department);
      $('#edit-user-group').val(data.group);
      $('#edit-user-id').val(data._id);

    } else {

      // display service error
      alert('Error: ' + data.message);
    }

  }).fail(function(jqXHR, textStatus, errorThrown) {

    if (jqXHR.status == 401) {
      window.location.href = "/";
    } else {
      var error = $.parseJSON(jqXHR.responseText);
      alert(error.message);
    }
  });
}

function saveUser(event) {

  event.preventDefault();

  // basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#edit-user input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });
  $('#edit-user select').each(function(index, val) {
    if(!$(this).val()) { errorCount++; }
  });

  if(errorCount === 0) {

    // create new user object
    var thisId = $('#edit-user input#edit-user-id').val();
    var editUser = {
      '_id': thisId,
      'username': $('#edit-user input#edit-user-username').val(),
      'password': $('#edit-user input#edit-user-password').val(),
      'name': $('#edit-user input#edit-user-name').val(),
      'department': $('#edit-user input#edit-user-department').val(),
      'group': $('#edit-user select#edit-user-group').val()
    }

    // ...and save it
    $.ajax({
      type: 'PUT',
      data: editUser,
      url: apiServer + '/api/users/' + thisId,
      headers: {
        "Authorization":"Token " + token
      }
    }).done(function(data, textStatus, jqXHR) {

      // check for success
      if (jqXHR.status == 200) {

        // populate users
        loadUsers();

      } else {

        // display service error
        alert('Error: ' + data.message);
      }

    }).fail(function(jqXHR, textStatus, errorThrown) {

      if (jqXHR.status == 401) {
        window.location.href = "/";
      } else {
        var error = $.parseJSON(jqXHR.responseText);
        alert(error.message);
      }
    });

    // hide dialog
    var modal = $.UIkit.modal("#edit-user");
    if (modal.isActive()) modal.hide();

  } else {

    // if errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};

function pageUsers(event, pageIndex) {

  event.preventDefault();

  // set current page for the service call
  usersCurrentPage = pageIndex + 1;

  // populate users
  _getUsers(false);
};

function reloadUsers() {

  event.preventDefault();

  // reset current page
  usersCurrentPage = 1;

  // populate users
  _getUsers(true);
}

function loadUsers() {

  event.preventDefault();

  // populate users
  _getUsers(false);
}

function _getUsers(resetPagination) {

  // empty content string
  var tableContent = '';

  // calculate offset for the service call
  var offset = (usersCurrentPage - 1) * globalItemsOnPage;

  // get name filter text
  var filter = $('input#search-user-name').val();

  // get users
  $.ajax({
    type: 'GET',
    url: apiServer + '/api/users?offset=' + offset + '&limit=' + globalItemsOnPage + '&name=' + filter,
    headers: {
      "Authorization":"Token " + token
    }
  }).done(function(data, textStatus, jqXHR) {

    // check for success
    if (jqXHR.status == 200) {

      // for each item in returned JSON, add a table row and cells to the content string
      $.each(data.users, function() {
        tableContent += '<tr>';
        tableContent += '<td>' + this.name + '</td>';
        tableContent += '<td>' + this.department + '</td>';
        tableContent += '<td class="uk-hidden-small">' + this.group + '</td>';
        tableContent += '<td class="uk-hidden-small">' + this.added.substring(0, 10) + '</td>';
        tableContent += '<td class="uk-hidden-small">' + this.updated.substring(0, 10) + '</td>';
        tableContent += '<td><a href="#" class="link-edit-user uk-icon-edit" rel="' + this._id + '"> Edit</a> | <a href="#" class="link-delete-user uk-icon-remove" rel="' + this._id + '"> Delete</a></td>';
        tableContent += '</tr>';
      });

      // inject the whole content string into existing HTML table
      $('#user-list table tbody').html(tableContent);

      // save users count
      usersItemCount = data.count;

      // display pagination
      var pagination = $.UIkit.pagination('#pag-users', { items:usersItemCount, itemsOnPage:globalItemsOnPage, currentPage:usersCurrentPage });

      // if count changed pagination needs to be reinitialized
      if (resetPagination) {

        // items and current page have to be manually set
        pagination.options.items = usersItemCount;
        pagination.options.currentPage = usersCurrentPage;
        pagination.init();
      }
    }

  }).fail(function(jqXHR, textStatus, errorThrown) {

    if (jqXHR.status == 401) {
      window.location.href = "/";
    } else {
      var error = $.parseJSON(jqXHR.responseText);
      alert(error.message);
    }
  });
};



// -------------------------------------------------------------------
// ------------------------------ Curve ------------------------------
// -------------------------------------------------------------------

function editCurve(event) {

  event.preventDefault();

  // display modal dialog
  var modal = $.UIkit.modal("#edit-curve");
  if (!modal.isActive()) {
    modal.show();
  }

  // retrieve candidate id from link rel attribute
  var candidateId = $(this).attr('rel');

  // load curves from the database
  $.ajax({
    type: 'GET',
    url: apiServer + '/api/candidates/' + candidateId + '/curves?userId=' + userId,
    headers: {
      "Authorization":"Token " + token
    }
  }).done(function(data, textStatus, jqXHR) {

    // check for success
    if (jqXHR.status == 200) {

      // save curves for browsing
      curveCount = data.count;
      curveIndex = 0;
      curves = new Array();
      $.each(data.curves, function( key, entry ) {
        curves.push(entry);
      })

      // set candidate id
      $('#rate-candidate-id').val(candidateId);

      showCurve();

    } else {

      // display service error
      alert('Error: ' + data.message);
    }

  }).fail(function(jqXHR, textStatus, errorThrown) {

    if (jqXHR.status == 401) {
      window.location.href = "/";
    } else {
      var error = $.parseJSON(jqXHR.responseText);
      alert(error.message);
    }
  });
};

function showCurve() {

  // enable/disable buttons
  $('#btn-back-curve').removeAttr('disabled');
  $('#btn-new-curve').removeAttr('disabled');
  $('#btn-forward-curve').removeAttr('disabled');
  if (curveIndex == 0) {
    $('#btn-back-curve').attr('disabled','');
  }
  if (curveIndex == (curveCount - 1)) {
    $('#btn-forward-curve').attr('disabled','');
  }
  if (curveIndex == curveCount) {
    $('#btn-back-curve').attr('disabled','');
    $('#btn-forward-curve').attr('disabled','');
    $('#btn-new-curve').attr('disabled','');

    var curve = {
      _id: 0,
      datum: '',
      event: '',
      comment: '',
      integrity: 1,
      motivation: 1,
      fit: 1,
      curiosity: 1,
      capacity: 1,
      dexterity: 1,
      networking: 1,
      leadership: 1,
      knowledge: 1,
      experience: 1
    }
    curves.push(curve);
  }

  // load values
  $('#rate-curve-id').val(curves[curveIndex]._id);
  $('#rate-date').val(curves[curveIndex].datum.substring(0, 10));
  $('#rate-event').val(curves[curveIndex].event);
  $('#rate-comment').val(curves[curveIndex].comment);

  $('#rate-integrity').simpleSlider("setValue", curves[curveIndex].integrity);
  $('#rate-motivation').simpleSlider("setValue", curves[curveIndex].motivation);
  $('#rate-fit').simpleSlider("setValue", curves[curveIndex].fit);
  $('#rate-curiosity').simpleSlider("setValue", curves[curveIndex].curiosity);
  $('#rate-capacity').simpleSlider("setValue", curves[curveIndex].capacity);
  $('#rate-dexterity').simpleSlider("setValue", curves[curveIndex].dexterity);
  $('#rate-networking').simpleSlider("setValue", curves[curveIndex].networking);
  $('#rate-leadership').simpleSlider("setValue", curves[curveIndex].leadership);
  $('#rate-knowledge').simpleSlider("setValue", curves[curveIndex].knowledge);
  $('#rate-experience').simpleSlider("setValue", curves[curveIndex].experience);
};

function backCurve(event) {
  event.preventDefault();

  curveIndex--;
  showCurve();
};

function newCurve(event) {
  event.preventDefault();

  curveIndex = curveCount;
  showCurve();
};

function forwardCurve(event) {
  event.preventDefault();

  curveIndex++;
  showCurve();
};

function cancelCurve(event) {

  event.preventDefault();

  // reset curve array
  curves = [];
  curveCount = 0;

  // hide dialog
  var modal = $.UIkit.modal("#edit-curve");
  if (modal.isActive()) modal.hide();
}

function deleteCurve(event) {

  event.preventDefault();

  // pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this curve?');

  // did user confirm
  if (confirmation === true) {

    // get candidate and curve ids
    var curveId = $('#edit-curve input#rate-curve-id').val();
    var candidateId = $('#edit-curve input#rate-candidate-id').val();

    // ...and delete
    $.ajax({
      type: 'DELETE',
      url: apiServer + '/api/candidates/' + candidateId + '/curves/' + curveId,
      headers: {
        "Authorization":"Token " + token
      }
    }).done(function(data, textStatus, jqXHR) {

      // check for success
      if (jqXHR.status != 200) {
        alert('Error: ' + data.message);
      }

      // reset curve array
      curves = [];
      curveCount = 0;

      // hide dialog
      var modal = $.UIkit.modal("#edit-curve");
      if (modal.isActive()) modal.hide();

    }).fail(function(jqXHR, textStatus, errorThrown) {

      if (jqXHR.status == 401) {
        window.location.href = "/";
      } else {
        var error = $.parseJSON(jqXHR.responseText);
        alert(error.message);
      }
    });

  } else {

    // if cancelled, do nothing
    return false;
  }
}

function saveCurve(event) {

  event.preventDefault();

  // basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#edit-curve input').each(function(index, val) {
    if($(this).val() === '') { errorCount++; }
  });
  $('#edit-curve select').each(function(index, val) {
    if(!$(this).val()) { errorCount++; }
  });

  if(errorCount === 0) {

    // create new curve object
    var thisId = $('#edit-curve input#rate-curve-id').val();
    var candidateId = $('#edit-curve input#rate-candidate-id').val();

    var curve = {
      'userId': userId,
      'candidateId': candidateId,
      'datum': $('#edit-curve input#rate-date').val(),
      'event': $('#edit-curve select#rate-event').val(),
      'comment': $('#edit-curve textarea#rate-comment').val(),
      'integrity': $('#edit-curve input#rate-integrity').val(),
      'motivation': $('#edit-curve input#rate-motivation').val(),
      'fit': $('#edit-curve input#rate-fit').val(),
      'curiosity': $('#edit-curve input#rate-curiosity').val(),
      'capacity': $('#edit-curve input#rate-capacity').val(),
      'dexterity': $('#edit-curve input#rate-dexterity').val(),
      'networking': $('#edit-curve input#rate-networking').val(),
      'leadership': $('#edit-curve input#rate-leadership').val(),
      'knowledge': $('#edit-curve input#rate-knowledge').val(),
      'experience': $('#edit-curve input#rate-experience').val()
    }

    if (thisId == 0) {

      // add new curve
      $.ajax({
        type: 'POST',
        data: curve,
        url: apiServer + '/api/candidates/' + candidateId + '/curves',
        headers: {
          "Authorization":"Token " + token
        }
      }).done(function(data, textStatus, jqXHR) {

        // check for success
        if (jqXHR.status != 201) {

          // display service error
          alert('Status=' + jqXHR.status);
          alert('Error: ' + data.message);
        }

      }).fail(function(jqXHR, textStatus, errorThrown) {

        if (jqXHR.status == 401) {
          window.location.href = "/";
        } else {
          var error = $.parseJSON(jqXHR.responseText);
          alert('Error: ' + error.message);
        }
      });

    } else {

      // update existing curve
      $.ajax({
        type: 'PUT',
        data: curve,
        url: apiServer + '/api/candidates/' + candidateId + '/curves/' + thisId,
        headers: {
          "Authorization":"Token " + token
        }
      }).done(function(data, textStatus, jqXHR) {

        // check for success
        if (jqXHR.status != 200) {

          // display service error
          alert('Error: ' + data.message);
        }

      }).fail(function(jqXHR, textStatus, errorThrown) {

        if (jqXHR.status == 401) {
          window.location.href = "/";
        } else {
          var error = $.parseJSON(jqXHR.responseText);
          alert(error.message);
        }
      });
    }

    // hide dialog
    var modal = $.UIkit.modal("#edit-curve");
    if (modal.isActive()) modal.hide();

  } else {

    // if errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};

function analyzeCurve(event) {

  event.preventDefault();

  // get users
  usersCurrent = new Map();
  var usersAll = new Map();

  // retrieve candidate id from link rel attribute
  var candidateId = $(this).attr('rel');

  // get curves
  $.ajax({
    type: 'GET',
    url: apiServer + '/api/users',
    headers: {
      "Authorization":"Token " + token
    }
  }).done(function(data, textStatus, jqXHR) {

    // check for success
    if (jqXHR.status == 200) {

      // for each item in returned JSON, add a table row and cells to the content string
      $.each(data.users, function() {
        usersAll.set(this._id, this.name);
      });

      // ...
      // load candidate curves
      $.ajax({
        type: 'GET',
        url: apiServer + '/api/candidates/' + candidateId + '/curves',
        headers: {
          "Authorization":"Token " + token
        }
      }).done(function(data, textStatus, jqXHR) {

        // check for success
        if (jqXHR.status == 200) {

          // save curves for browsing
          curveCount = data.count;
          curveIndex = 0;
          curves = new Array();
          events = new Array();
          $.each(data.curves, function(key, curve) {
            curves.push(curve);
            usersCurrent.set(curve.userId, usersAll.get(curve.userId));
            events.pushIfNotExist(curve.event);
          });

          // sort events
          events.sort();

          // set active to be all current users
          usersActive = usersCurrent;
          eventsActive = events;

          // display modal dialog
          var modal = $.UIkit.modal("#analyze-curve");
          if (!modal.isActive()) {
            modal.show();
          }

          // display the curves
          drawCurves(true);
        } else {

          // display service error
          alert('Error: ' + data.message);
        }

      }).fail(function(jqXHR, textStatus, errorThrown) {

        if (jqXHR.status == 401) {
          window.location.href = "/";
        } else {
          var error = $.parseJSON(jqXHR.responseText);
          alert(error.message);
        }
      });
    }

  }).fail(function(jqXHR, textStatus, errorThrown) {

    if (jqXHR.status == 401) {
      window.location.href = "/";
    } else {
      var error = $.parseJSON(jqXHR.responseText);
      alert(error.message);
    }
  });
}

function drawCurves(initialize) {

  if (initialize) {
    var buttons = '';

    for (var i = 0; i < events.length; i++) {
      buttons += '<p><button class="uk-button uk-active uk-align-center" style="width:120px" rel="'+events[i]+'">'+events[i]+'</button>';
    }

    $('#analyze-curve-users').html(buttons);
  }

  var options = {};
  temp1 = {}; temp1 ["position"] = "nw";
  options ["legend"] = temp1;
  temp1 = {}; temp2 = {}; temp2 ["show"] = true; temp1 ["lines"] = temp2; temp1 ["points"] = temp2;
  options ["series"] = temp1;
  temp1 = {}; temp1 ["ticks"] = 5; temp1 ["min"] = 0.8; temp1 ["max"] = 5.2; temp1 ["ticksDecimals"] = 0;
  options ["xaxis"] = temp1;

  niz0 = [];
  niz1 = []; niz1.push(1); niz1.push("Experience"); niz0.push(niz1);
  niz1 = []; niz1.push(2); niz1.push("Knowledge"); niz0.push(niz1);
  niz1 = []; niz1.push(3); niz1.push("Leadership"); niz0.push(niz1);
  niz1 = []; niz1.push(4); niz1.push("Networking"); niz0.push(niz1);
  niz1 = []; niz1.push(5); niz1.push("Dexterity"); niz0.push(niz1);
  niz1 = []; niz1.push(6); niz1.push("Capacity"); niz0.push(niz1);
  niz1 = []; niz1.push(7); niz1.push("Curiosity"); niz0.push(niz1);
  niz1 = []; niz1.push(8); niz1.push("Fit"); niz0.push(niz1);
  niz1 = []; niz1.push(9); niz1.push("Motivation"); niz0.push(niz1);
  niz1 = []; niz1.push(10); niz1.push("Integrity"); niz0.push(niz1);

  temp1 = {}; temp1 ["ticks"] = niz0;
  options ["yaxis"] = temp1;
  temp1 = {}; temp1 ["labelMargin"] = 10; temp1 ["borderWidth"] = 2;
  options ["grid"] = temp1;

  var dataIdeal = [[2,1],[2,2],[3,3],[3,4],[3,5],[4,6],[4,7],[4,8],[4,9],[4,10]];
  var data = new Array();
  var dataUsers = new Array();
  var index = 0;
  var script = '';

  for (var i = 0; i < curves.length; i++) {

    if(eventsActive.inArray(curves[i].event)) {
      data[index] = [[curves[i].experience,1],[curves[i].knowledge,2],[curves[i].leadership,3],
      [curves[i].networking,4],[curves[i].dexterity,5],[curves[i].capacity,6],
      [curves[i].curiosity,7],[curves[i].fit,8],[curves[i].motivation,9],[curves[i].integrity,10]];

      dataUsers[index++] = usersCurrent.get(curves[i].userId);
      script += '{label:"' + usersCurrent.get(curves[i].userId) + '",data:data[' + index++ +']},';
    }
  }

  dataset = [];
  temp0 = {}; temp0 ["label"] = "Ideal"; temp0 ["data"] = dataIdeal; temp0 ["color"] = "#E41B17";
  temp1 = {}; temp1 ["lineWidth"] = 5; temp0 ["lines"] = temp1;
  dataset.push(temp0);

  for (var i = 0; i < data.length; i++) {
    temp0 = {}; temp0 ["label"] = dataUsers[i]; temp0 ["data"] = data[i];
    dataset.push(temp0);
  }

  $.plot($('#curve-id'), dataset, options);
};

function selectCurveUsers(event) {

  if ($(this).hasClass('uk-active')) {
    // button up
    eventsActive.delete($(this).attr('rel'));
  } else {
    // button down
    eventsActive.push($(this).attr('rel'));
    eventsActive.sort();
  }

  // display the curves
  drawCurves(false);
}
