import * as Athena from '@AthenaClient/api';

const buttonContainer = document.getElementById('sirenMasteryButtons');
let backlight = false;

function addButton(id: number, text: string) {
    const button = document.createElement('div');
    const buttonInner = document.createElement('div');
    const buttonText = document.createElement('span');

    buttonText.innerHTML = text;

    button.classList.add('sirenMasteryButton');
    buttonInner.classList.add('sirenMasteryButtonInner');

    if (backlight) button.classList.add('backlight');

    buttonInner.appendChild(buttonText);
    button.appendChild(buttonInner);

    button.setAttribute('data-id', id + '');

    buttonContainer.appendChild(button);
}

function toggleBacklight(toggle: boolean) {
    for (const child of buttonContainer.children) {
        for (const c of child.classList) {
            if (toggle) {
                if (!child.classList.contains('backlight')) child.classList.add('backlight');
            } else if (child.classList.contains('backlight')) child.classList.remove('backlight');
        }

        backlight = toggle;
    }
}

function setActive(id: number, toggle: boolean) {
    const button = document.querySelector('.sirenMasteryButton[data-id="' + id + '"]');

    if (button) {
        if (toggle) {
            if (!button.classList.contains('active')) button.classList.add('active');
        } else if (button.classList.contains('active')) button.classList.remove('active');
    }
}

if ('alt' in window) {
    alt.on('sirenMastery:addButtons', (buttons: Array<any>) => {
        for (const b of buttons) addButton(b.id, b.displayName);
    });

    alt.on('sirenMastery:setButtonActive', setActive);
    alt.on('sirenMastery:toggleBacklight', toggleBacklight);
}
