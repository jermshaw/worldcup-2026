const xCoords = [];
let time = 0;

for (let i = 0; i <= 300; i++) {
  xCoords.push(i);
}

const animate = function() {
  let sideTop, sideBottom;
  const frequency = 30;
  const height = 10;
  const topOffset = 50;
  const points = xCoords.map(x => {
    
    let y = Math.sin((x + time) / frequency) * height + topOffset;
    
    return [x, y];
  });
  
  const topPath = "M" + points.map(p => {
    if (p[0] === 298) {
      sideTop = p[1];
      sideBottom = p[1] + 200;
    }
    return `${p[0]},${p[1]}`;
  }).join(" L");
  
  const bottomPath = "M" + points.map(p => {
    return `${p[0]},${p[1] + 200}`;
  }).join(" L");
  
  const sidePath = `M298,${sideTop} L298,${sideBottom}`;
  
  document.querySelector(".flag-top").setAttribute("d", topPath);
  document.querySelector(".flag-bottom").setAttribute("d", bottomPath);
  document.querySelector(".flag-side").setAttribute("d", sidePath);
  
  time -= 1;
  
  requestAnimationFrame(animate);
};

animate();