<?php

$link = mysqli_connect("digitalgreens.cixglou4nxxh.us-east-1.rds.amazonaws.com", "jvoves", "digitalgreens", "energyhill");

/* check connection */
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

$query = "SELECT name, description, longitude, latitude, link FROM site;";

if ($result = mysqli_query($link, $query)) {
    $rows = Array();
    /* fetch associative array */
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
        //printf ("%s \n", $row["name"]);
    }
    /* free result set */
    echo json_encode($rows);
    mysqli_free_result($result);
}

/* close connection */
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