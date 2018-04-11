var flaskURL = 'https://www.eg.bucknell.edu/energyhill/';
var chartURL = 'https://www.eg.bucknell.edu/~energyhill/Flower/web/create/'
var id_token = ''

class Requests {

  getChartURL(){
    return chartURL;
  }

  /*
	User to pre-load user profile w/ all projects, devices, and sensors
  */
  loadProfile(googleUser) {
    id_token = googleUser.getAuthResponse().id_token;

    var form_data = new FormData();
    form_data.append('idtoken', id_token);

    var xhr = new XMLHttpRequest();
    const url = flaskURL + 'get-profile';
    xhr.open('POST', url);
    xhr.withCredentials = true;
    xhr.responseType = 'json';

    const scope = this;
    xhr.onload = function() {
      console.log(xhr.response)
      if (xhr.response == null) {
        scope.setState({researcher: null, signInState: 2, profileEmail: googleUser.getBasicProfile().getEmail(), token: id_token})
      } else {
        scope.setState({researcher: xhr.response, signInState: 1, profileEmail: googleUser.getBasicProfile().getEmail(), token: id_token})
      }
    };
    xhr.send(form_data);
  }

  requestAcess(id_token, signOut) {
    var form_data = new FormData();
    form_data.append('idtoken', id_token);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.eg.bucknell.edu/energyhill/request-access');
    xhr.withCredentials = true;
    xhr.onload = undefined;
    xhr.send(form_data);
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
        //window.location.reload();
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
    form_data.append('fields', 'name, units, alertMinVal, alertMaxVal')
    form_data.append('values', this.state.name + ', ' + this.state.units + ', ' + this.state.limLow + ', ' + this.state.limHigh)
    form_data.append('condition_fields', 'sensorId')
    form_data.append('condition_values', this.state.id)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'update');
    xhr.withCredentials = true;

    xhr.onload = function() {
        //window.location.reload();
    };
    xhr.send(form_data);
  }


  createProject(projectName){
    var form_data = new FormData();
    form_data.append('idtoken', id_token);
    form_data.append('table', 'project')
    form_data.append('fields', 'name')
    form_data.append('values', projectName)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', flaskURL + 'insert');
    xhr.withCredentials = true;

    xhr.onload = function() {
        //console.log(xhr.response)
        //window.location.reload();
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
      let status = xhr.status;
      if(status === 503){
        scope.checkUploadStatus()
      }
      else{
        console.log(status)
      }
    };
    xhr.send(form_data);
  }

}

export default (new Requests);
