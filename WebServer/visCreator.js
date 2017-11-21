// jQuery time
var currentFs, nextFs, previousFs; // fieldsets
var left, opacity, scale; // fieldset properties which we will animate
var animating; // flag to prevent quick multi-click glitches

$('.next').click(function() {
    if (animating) return false;
    animating = true;

    currentFs = $(this).parent();
    nextFs = $(this).parent().next();

    // activate next step on progressbar using the index of nextFs
    $('#progressbar li').eq($('fieldset').index(nextFs)).addClass('active');

    // show the next fieldset
    nextFs.show();
    // hide the current fieldset with style
    currentFs.animate({opacity: 0}, {
        step: function(now, mx) {
            // as the opacity of currentFs reduces to 0 - stored in "now"
            // 1. scale currentFs down to 80%
            scale = 1 - (1 - now) * 0.2;
            // 2. bring nextFs from the right(50%)
            left = (now * 50)+'%';
            // 3. increase opacity of nextFs to 1 as it moves in
            opacity = 1 - now;
            currentFs.css({'transform': 'scale('+scale+')'});
            nextFs.css({'left': left, 'opacity': opacity});
        },
        duration: 500,
        complete: function() {
            currentFs.hide();
            animating = false;
        },
        // this comes from the custom easing plugin
        easing: 'easeOutQuint',
    });
});

$('.previous').click(function() {
    if (animating) return false;
    animating = true;

    currentFs = $(this).parent();
    previousFs = $(this).parent().prev();

    // de-activate current step on progressbar
    $('#progressbar li').eq($('fieldset').index(currentFs)).removeClass(
        'active');

    // show the previous fieldset
    previousFs.show();
    // hide the current fieldset with style
    currentFs.animate({opacity: 0}, {
        step: function(now, mx) {
            // as the opacity of currentFs reduces to 0 - stored in "now"
            // 1. scale previousFs from 80% to 100%
            scale = 0.8 + (1 - now) * 0.2;
            // 2. take currentFs to the right(50%) - from 0%
            left = ((1-now) * 50)+'%';
            // 3. increase opacity of previousFs to 1 as it moves in
            opacity = 1 - now;
            currentFs.css({'left': left});
            previousFs.css({
                'transform': 'scale('+scale+')', 'opacity': opacity});
        },
        duration: 500,
        complete: function() {
            currentFs.hide();
            animating = false;
        },
        // this comes from the custom easing plugin
        easing: 'easeOutQuint',
    });
});

$('.submit').click(function() {
    return false;
});
