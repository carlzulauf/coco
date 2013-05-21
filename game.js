$(function(){
  placeArmies(0,3,2);
  placeArmies(3,0,2);
});

function placeArmies (row, col, num){
  var tr = $($("#gameboard tr")[row]);
  var td = $(tr.find("td")[col]);
  td.text("" + num);
}
