<?php
$config = json_decode(file_get_contents("config.json"));
$link = mysqli_connect($config->DB_URL, $config->DB_USERNAME, $config->DB_PASSWORD, $config->DB_NAME);

//make sure connection is established
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

//get name, description, longitude, latitude, link from site table
$query = "SELECT name, description, longitude, latitude, link FROM site;";

//put al sites in an array and output as json
if ($result = mysqli_query($link, $query)) {
    $rows = Array();
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }
    echo json_encode($rows);
    mysqli_free_result($result);
}

mysqli_close($link);










/*
    //open connection to mysql db
    $connection = mysqli_connect("digitalgreens.cixglou4nxxh.us-east-1.rds.amazonaws.com","jvoves","digitalgreens");

    $sql = "select name from site";
    $result = mysqli_query($connection, $sql);


    $emparray = array();
    while($row = mysqli_fetch_assoc($result))
    {
        $emparray[] = $row;
    }


    echo json_encode($emparray);

    //close the db connection
    mysqli_close($connection);
    */


?>
