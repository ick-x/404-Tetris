const backgroundToggle = document.getElementById('backgroundToggle');
const gameContainer = document.getElementById('gameContainer');
const rightKeyImage = document.getElementById('rightKeyImage');
const leftKeyImage = document.getElementById('leftKeyImage');
const downKeyImage = document.getElementById('downKeyImage');
const upKeyImage = document.getElementById('upKeyImage');
const rKeyImage = document.getElementById('rKeyImage');
const spaceKeyImage = document.getElementById('spaceKeyImage');

const DKeyImage = document.getElementById('DKeyImage');
const QKeyImage = document.getElementById('QKeyImage');
const ZKeyImage = document.getElementById('ZKeyImage');
const SKeyImage = document.getElementById('SKeyImage');

// Background toggle switch
backgroundToggle.addEventListener('change', function () {
    document.activeElement.blur();
    // Define styles based on the toggle state
    const backgroundColor = this.checked ? 'black' : 'white';
    const textColor = this.checked ? 'white' : 'black';
    const borderColor = this.checked ? '1px solid white' : '1px solid black';
    const keyImagePrefix = this.checked ? 'White' : 'Black';

    // Apply styles to element
    document.body.style.backgroundColor = backgroundColor;
    gameContainer.style.color = textColor;
    document.getElementById("tetrisCanvas").style.border = borderColor;

    // Update images for controls based
    rightKeyImage.src = `../images/${keyImagePrefix}/RightKey.png`;
    leftKeyImage.src = `../images/${keyImagePrefix}/LeftKey.png`;
    downKeyImage.src = `../images/${keyImagePrefix}/DownKey.png`;
    upKeyImage.src = `../images/${keyImagePrefix}/UpKey.png`;
    rKeyImage.src = `../images/${keyImagePrefix}/RKey.png`;
    spaceKeyImage.src = `../images/${keyImagePrefix}/SpaceKey.png`;
    QKeyImage.src = `../images/${keyImagePrefix}/QKey.png`;
    DKeyImage.src = `../images/${keyImagePrefix}/DKey.png`;
    ZKeyImage.src = `../images/${keyImagePrefix}/ZKey.png`;
    SKeyImage.src = `../images/${keyImagePrefix}/SKey.png`;
});
