var deploy_config={};
$.getJSON('../../deployment.json', function(data) {
    deploy_config = data;
});
