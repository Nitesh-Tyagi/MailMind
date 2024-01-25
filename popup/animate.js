let c1 = document.getElementById('c1');
let c2 = document.getElementById('c2');
let c3 = document.getElementById('c3');

function animate12 () {
    c2.style.fill = '#A5FFBE';
    c1.style.fill = '#D9D9D9';

    key.classList.add('stage2');
    key.classList.remove('stage1');

    left.classList.add('stage2');
    left.classList.remove('stage1');

    right.classList.add('stage2');
    right.classList.remove('stage1');

    requestGetData('openID', function(openID) { key.value = openID; });
    left.innerText = 'Log Out';
    right.innerText = 'Turn On';
}

function animate21 () {
    c1.style.fill = '#A5FFBE';
    c2.style.fill = '#D9D9D9';

    key.classList.add('stage1');
    key.classList.remove('stage2');

    left.classList.add('stage1');
    left.classList.remove('stage2');

    right.classList.add('stage1');
    right.classList.remove('stage2');

    requestGetData('openID', function(openID) { key.value = openID; });
    left.innerText = '';
    right.innerText = 'Log In';
}

function animate23 () {
    c3.style.fill = '#A5FFBE';
    c2.style.fill = '#D9D9D9';

    key.classList.add('stage3');
    key.classList.remove('stage2');

    left.classList.add('stage3');
    left.classList.remove('stage2');

    right.classList.add('stage3');
    right.classList.remove('stage2');

    requestGetData('openID', function(openID) { key.value = openID; });
    left.innerText = 'Turn Off';
    right.innerText = '';
}

function animate32 () {
    c2.style.fill = '#A5FFBE';
    c3.style.fill = '#D9D9D9';

    key.classList.add('stage2');
    key.classList.remove('stage3');

    left.classList.add('stage2');
    left.classList.remove('stage3');

    right.classList.add('stage2');
    right.classList.remove('stage3');

    requestGetData('openID', function(openID) { key.value = openID; });
    left.innerText = 'Log Out';
    right.innerText = 'Turn On';
}

function initialStage () {
    requestGetData('stage', function(stage) {
        if(stage==1){
            c1.style.fill = '#A5FFBE';

            key.classList.add('stage1');
            left.classList.add('stage1');
            right.classList.add('stage1');

            requestGetData('openID', function(openID) { key.value = openID; });
            left.innerText = '';
            right.innerText = 'Log in';
        }
        else if(stage==2){
            c2.style.fill = '#A5FFBE';

            key.classList.add('stage2');
            left.classList.add('stage2');
            right.classList.add('stage2');

            requestGetData('openID', function(openID) { key.value = openID; });
            left.innerText = 'Log Out';
            right.innerText = 'Turn On';
        }
        else if(stage==3){
            c3.style.fill = '#A5FFBE';

            key.classList.add('stage3');
            left.classList.add('stage3');
            right.classList.add('stage3');

            requestGetData('openID', function(openID) { key.value = openID; });
            left.innerText = 'Turn Off';
            right.innerText = '';
        }
        else {
            requestSetData('dark', 'dark'); // dark, light
            requestSetData('stage', 1); // 1, 2, 3
            requestSetData('openID', ''); // #string
            requestSetData('hide',1); // 1 = show, 0 = hide
        }
    });
}

initialStage();