<?php

$recipes = array();
foreach (glob("details/*.md") as $filename) {
  array_push($recipes, array(
    'slug' => str_replace(".md", "", basename($filename)),
    'title' => array_shift(explode("\n", file_get_contents($filename)))
  ));
}

header("Content-type: application/json; charset=UTF-8");
print json_encode($recipes);
