

document.querySelector(".js-go").addEventListener('click',function(){
var input = document.querySelector("input").value;
pushToDom(input);


});

	function pushToDom(input){
		var container= document.querySelector(".js-container");
		container.innerHTML=input;
	}