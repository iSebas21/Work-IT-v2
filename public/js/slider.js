window.onload = carouselSlider();
function carouselSlider(){
    let i=0;
    const images = ['/resources/assets/bg-5.jpg','/resources/assets/bg-6.jpg','/resources/assets/bg-7.jpg'],
    $bg = document.querySelector('#slider'),
    arrayLength = images.length,
    nextSlider = () =>{
        i++;
        if(i>arrayLength-1){
            i=0;
            $bg.style.backgroundImage = `url(${images[i]})`;
        }else{
            $bg.style.backgroundImage = `url(${images[i]})`;
        }
        console.log(`Imagen ${i}`);
    }
    $bg.style.backgroundImage = `url(${images[i]})`;
    setInterval(() =>{
        nextSlider();
    },7000)
}