var flaskURL = 'https://www.eg.bucknell.edu/energyhill/';
var chartURL = 'https://www.eg.bucknell.edu/~energyhill/Flower/web/create/'
var id_token = ''
var user_id = -1

class Requests {

  getChartURL(){
    return chartURL;
  }

  /*
	User to pre-load user profile w/ all projects, devices, and sensors
  */
  loadProfile(googleUser) {
    id_token = googleUser.Zi.id_token;

    var form_data = new FormData();
    form_data.append('idtoken', id_token);

    var xhr = new XMLHttpRequest();
    const url = flaskURL + 'get-profile';
    xhr.open('POST', url);
    xhr.withCredentials = true;
    xhr.responseType = 'json';

    const scope = this;
    xhr.onload = function() {
      localStorage.setItem('gUser', JSON.stringify(googleUser));
      if (xhr.response == null) {
        localStorage.setItem('isAuth', false)
        scope.setState({isAuthenticated: false, researcher: null, gUser: googleUser})
      } 
      else {
        user_id = xhr.response.id
        localStorage.setItem('isAuth', true);
        scope.setState({isAuthenticated: true, researcher: xhr.response, gUser: googleUser})
      }
    };
    xhr.send(form_data);
  }

  requestAccess() {
    var form_data = new FormData();
    form_data.append('idtoken', id_token);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.eg.bucknell.edu/energyhill/request-access');
    xhr.withCredentials = true;
    xhr.onload = undefined;
    xhr.send(form_data);
  }

  getAllOtherProjects(){
      var xhr = new XMLHttpRequest();
      const url = flaskURL + 'get-all-others-projects?userId=' + user_id;
      xhr.open('GET', url);
      xhr.withCredentials = true;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      const scope = this;
      xhr.onload = function() {
        if(xhr.response.length > 0){
          scope.setState({otherProjects: xhr.response, activeProjectId: xhr.response[0].projectId})
        }
      };
      xhr.send();
  }

  /*
	Get all projects for Iframe generator (researchers can visualize projects that do not belong to them.)
  */
  getAllProjects(){
      var xhr = new XMLHttpRequest();
      const url = flaskURL + 'get-all-sensors';
      xhr.open('GET', url);
      xhr.withCredentials = true;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      const scope = this;
      xhr.onload = function() {
        let activeProj = scope.getActiveProject(xhr.response.projects);
        scope.setState({allProjects: xhr.response.projects, activeProject: activeProj});
      };
      xhr.send();
  }

  /*
    Find all devices not assigned to a project.
  */
  getUnclaimedDevices(){
      var xhr = new XMLHttpRequest();
      var url = flaskURL + 'read?table=device&fields=*&condition_fields=projectId&condition_values=null';

      xhr.open('GET', url);
      xhr.withCredentials = true;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      const scope = this;
      xhr.onload = function() {
        console.log(xhr.response)
        scope.setState({unclaimedDevices: xhr.response});
      };
      xhr.send();
  }


  /*
    Find all devices not assigned to a project.
  */
  getAllSites(){
      var xhr = new XMLHttpRequest();
      var url = flaskURL + 'read?table=site&fields=*&condition_fields=null&condition_values=null';

      xhr.open('GET', url);
      xhr.withCredentials = true;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      const scope = this;
      xhr.onload = function() {
        scope.setState({sites: xhr.response})
      };
      xhr.send();
  }



  getAlerts(){
    var xhr = new XMLHttpRequest();
    var url = flaskURL + 'read?table=alerts&fields=alertId,handled,alertTime&condition_fields=sensorId&condition_values=' + this.props.sensor.id;
    xhr.open('GET', url);
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    const scope = this;
    xhr.onload = function() {
        scope.setState({alertData: xhr.response, show: true});
    };
    xhr.send();
  }

  handleAlerts(sensorId) {
    var form_data = new FormData();

    form_data.append('idtoken', id_token);
    form_data.append('table', 'alerts');
    form_data.append('fields', 'handled');
    form_data.append('values', '2');
    form_data.append('condition_fields', 'sensorId')
    form_data.append('condition_values', this.props.sensor.id);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'update');
    xhr.withCredentials = true;

    xhr.onload = function() {
        window.location.reload();
    };
    xhr.send(form_data);
  }


  unlinkProject(projectId) {
    var form_data = new FormData();

    form_data.append('idtoken', id_token);
    form_data.append('table', 'owners');
    form_data.append('fields', 'userId');
    form_data.append('values', null);
    form_data.append('condition_fields', 'userId, projectId')
    form_data.append('condition_values', user_id + ", " + projectId);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'update');
    xhr.withCredentials = true;

    xhr.onload = function() {
    };
    xhr.send(form_data);
  }


  claimDevice() {
    var form_data = new FormData();

    form_data.append('idtoken', id_token);
    form_data.append('table', 'device')
    form_data.append('fields', 'projectId, name')
    form_data.append('values', this.props.activeProject.id + ', ' + this.state.deviceName)
    form_data.append('condition_fields', 'deviceId')
    form_data.append('condition_values', this.props.device.deviceId)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'update');
    xhr.withCredentials = true;

    xhr.onload = function() {
        window.location.reload();
    };
    xhr.send(form_data);
  }

  updateSensor() {
    var form_data = new FormData();
    form_data.append('idtoken', id_token);
    form_data.append('table', 'sensor')
    form_data.append('fields', 'displayName, units, alertsEnabled, alertMinVal, alertMaxVal, minMsg, maxMsg')
    form_data.append('values', this.state.name + ', ' + this.state.units + ', ' + this.state.alerts + ', ' + this.state.min + ', ' + this.state.max + ', ' + this.state.min_msg + ', ' + this.state.max_msg)
    form_data.append('condition_fields', 'sensorId')
    form_data.append('condition_values', this.state.id)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'update');
    xhr.withCredentials = true;

    xhr.onload = function() {
        window.location.reload();
    };
    xhr.send(form_data);
  }

  updateProject(projectId) {
    var form_data = new FormData();

    this.setState({iconLoading: true})

    form_data.append('idtoken', id_token);
    form_data.append('table', 'project');
    form_data.append('fields', 'siteId, name, description, isPrivate, url');
    form_data.append('values', this.state.siteId + ', ' + this.state.name + ', ' + this.state.desc + ', ' + this.state.scope + ', ' + this.state.url);
    form_data.append('condition_fields', 'projectId')
    form_data.append('condition_values', projectId);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'update');
    xhr.withCredentials = true;

    let scope = this;
    xhr.onload = function() {
      scope.setState({iconLoading: false})
      window.location.reload();
    };
    xhr.send(form_data);
  }


  createProject(projectName){
    console.log(projectName)
    console.log(id_token)
    var form_data = new FormData();
    form_data.append('idtoken', id_token);
    form_data.append('table', 'project')
    form_data.append('fields', 'name')
    form_data.append('values', projectName)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'insert');
    xhr.withCredentials = true;

    let scope = this;
    xhr.onload = function() {
      var xhr = new XMLHttpRequest();
      var url = flaskURL + 'read?table=project&fields=projectId&condition_fields=name&condition_values=' + projectName;
      xhr.open('GET', url);
      xhr.withCredentials = true;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      xhr.onload = function() {
        console.log(xhr.response)
        scope.linkProject(xhr.response[xhr.response.length-1].projectId)
      };
      xhr.send();
    };
    xhr.send(form_data);
  }

  deleteDevice(deviceId){
    var form_data = new FormData();
    form_data.append('idtoken', id_token);
    form_data.append('table', 'device')
    form_data.append('condition_fields', 'deviceId')
    form_data.append('condition_values', deviceId);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'delete');
    xhr.withCredentials = true;

    xhr.onload = function() {
    };
    xhr.send(form_data);     
  }

  deleteProject(projectId){
    var form_data = new FormData();
    form_data.append('idtoken', id_token);
    form_data.append('table', 'owners')
    form_data.append('condition_fields', 'userId, projectId')
    form_data.append('condition_values', user_id + ", " + projectId);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'delete');
    xhr.withCredentials = true;

    xhr.onload = function() {
    };
    xhr.send(form_data);    
  }

  deleteUser(userEmail){
    var form_data = new FormData();
    form_data.append('idtoken', id_token);
    form_data.append('table', 'user')
    form_data.append('condition_fields', 'email')
    form_data.append('condition_values', userEmail);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'delete');
    xhr.withCredentials = true;

    xhr.onload = function() {
    };
    xhr.send(form_data); 
  }

  updateUserAdmin(userEmail){
    var form_data = new FormData();

    form_data.append('idtoken', id_token);
    form_data.append('table', 'project');
    form_data.append('fields', 'isAdmin');
    form_data.append('values', 1);
    form_data.append('condition_fields', 'email')
    form_data.append('condition_values', userEmail);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'update');
    xhr.withCredentials = true;

    let scope = this;
    xhr.onload = function() {
    };
    xhr.send(form_data);
  }


  linkProject(projectId){
    var form_data = new FormData();
    form_data.append('idtoken', id_token);
    form_data.append('table', 'owners')
    form_data.append('fields', 'userId, projectId')
    form_data.append('values', user_id + ", " + projectId);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'insert');
    xhr.withCredentials = true;

    xhr.onload = function() {
        window.location.reload();
    };
    xhr.send(form_data);
  }


  uploadFile(file){

    console.log("Uploading File");
    console.log("DEVICE: " + this.props.device.id)
    console.log("FILE: " + file)


    var form_data = new FormData();
    form_data.append('idtoken', id_token);
    form_data.append('deviceid', this.props.device.id)
    form_data.append('file', file)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'store-code');
    xhr.withCredentials = true;

    const scope = this;
    xhr.onload = function() {
      console.log("SUCCESS GOT HEX FILE")
      console.log(xhr.response)
      scope.checkUploadStatus()
    };
    xhr.send(form_data);
  }


  checkUploadStatus(){
    var form_data = new FormData();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', flaskURL + 'check-error?deviceid=' + this.props.device.id);
    xhr.withCredentials = true;

    const scope = this;
    xhr.onload = function() {
      console.log("CHECKING STATUS OF UPLOAD")
      console.log(xhr.response)
      let status = xhr.status;
      if(status === 503){
        scope.checkUploadStatus()
      }
      else if(status === 200){
        scope.setState({uploading: false})
        scope.uploadSuccess();
      }
      else if(status === 500){
        scope.setState({uploading: false})
        scope.uploadError();
      } else {
        // TODO: have some other option if none of the three are returned (something seriously bad went wrong)
        scope.setState({uploading:false})
        scope.uploadError(xhr.responseText);
      }
    };
    xhr.send(form_data);
  }

}

export default (new Requests);
