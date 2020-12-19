import 'focus-visible';
import 'html-midi-player';
import {blobToNoteSequence} from '@magenta/music';

window.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('midiFile');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            blobToNoteSequence(e.target.files[0]).then((seq) => {
                document.getElementById('mainPlayer').noteSequence = seq;
                document.getElementById('mainVisualizer').noteSequence = seq;
            }).catch((reason) => {
                alert('Failed to load MIDI file.');
                console.error(reason);
            });
        });
    }
});
