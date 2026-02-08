(function () {
  'use strict';

  var STORAGE_KEY = 'sfsc_data';

  var FEAR_LABELS = [
    'Fear of self-indulgence or letting oneself off the hook',
    'Fear that self-compassion is a form of self-pity',
    'Fear of becoming complacent or lacking motivation',
    'Fear of appearing narcissistic or self-absorbed',
    'Discomfort with warmth/kindness toward self; belief one doesn\'t deserve it',
    'Associations of self-compassion with weakness and vulnerability'
  ];

  function getData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function generatePdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('PDF library is still loading. Please wait a moment and try again.');
      return;
    }
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: 'mm', format: 'a4' });

    var pageWidth = doc.internal.pageSize.getWidth();
    var margin = 20;
    var maxWidth = pageWidth - margin * 2;
    var y = margin;
    var lineHeight = 6;

    function checkPage(needed) {
      if (y + needed > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
    }

    function addTitle(text) {
      checkPage(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(text, margin, y);
      y += 10;
    }

    function addHeading(text) {
      checkPage(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(text, margin, y);
      y += 8;
    }

    function addLabel(text) {
      checkPage(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      var lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach(function (line) {
        checkPage(lineHeight);
        doc.text(line, margin, y);
        y += lineHeight;
      });
      y += 2;
    }

    function addText(text) {
      if (!text) {
        addItalic('(no response)');
        return;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      var lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach(function (line) {
        checkPage(lineHeight);
        doc.text(line, margin, y);
        y += lineHeight;
      });
      y += 4;
    }

    function addItalic(text) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text(text, margin, y);
      y += lineHeight + 4;
    }

    function addSeparator() {
      checkPage(8);
      doc.setDrawColor(197, 198, 232);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    }

    var data = getData();

    // --- Title ---
    addTitle('My Self-Compassion Writing Responses');
    addSeparator();

    // --- Stage 1 ---
    var s1 = data.stage1 || {};
    var hasStage1 = s1.eventDescription || s1.identityCulture || s1.kindness ||
      s1.commonHumanityStatement1 || s1.shameRatingPre !== undefined;

    if (hasStage1) {
      addHeading('Stage 1 \u2014 Introduction to Self-Compassion');
      y += 2;

      addLabel('Event Description:');
      addText(s1.eventDescription);

      addLabel('Shame Rating (before exercise):');
      addText(s1.shameRatingPre !== undefined ? s1.shameRatingPre + ' / 100' : '');

      addLabel('Identity & Culture Reflection:');
      addText(s1.identityCulture);

      addLabel('Common Humanity \u2014 Statement 1:');
      addText(s1.commonHumanityStatement1);

      addLabel('Common Humanity \u2014 Statement 2:');
      addText(s1.commonHumanityStatement2);

      addLabel('Common Humanity \u2014 Statement 3:');
      addText(s1.commonHumanityStatement3);

      addLabel('Kindness Paragraph:');
      addText(s1.kindness);

      addLabel('Shame Rating (after exercise):');
      addText(s1.shameRatingPost !== undefined ? s1.shameRatingPost + ' / 100' : '');

      addSeparator();
    }

    // --- Stage 2 ---
    var s2 = data.stage2 || {};
    var hasStage2 = s2.eventDescription || s2.challengeMisconceptions || s2.kindness ||
      s2.selfCompassionPhrase || (s2.selectedFears && s2.selectedFears.length > 0);

    if (hasStage2) {
      addHeading('Stage 2 \u2014 Fear of Self-Compassion');
      y += 2;

      if (s2.selectedFears && s2.selectedFears.length > 0) {
        addLabel('Selected Fears of Self-Compassion:');
        s2.selectedFears.forEach(function (idx) {
          addText('\u2022 ' + (FEAR_LABELS[idx] || 'Fear #' + (idx + 1)));
        });
      }

      addLabel('Challenge Misconceptions:');
      addText(s2.challengeMisconceptions);

      addLabel('Event Description:');
      addText(s2.eventDescription);

      addLabel('Shame Rating (before exercise):');
      addText(s2.shameRatingPre !== undefined ? s2.shameRatingPre + ' / 100' : '');

      addLabel('Identity & Culture Reflection:');
      addText(s2.identityCulture);

      addLabel('Common Humanity \u2014 Statement 1:');
      addText(s2.commonHumanityStatement1);

      addLabel('Common Humanity \u2014 Statement 2:');
      addText(s2.commonHumanityStatement2);

      addLabel('Common Humanity \u2014 Statement 3:');
      addText(s2.commonHumanityStatement3);

      addLabel('Kindness Paragraph:');
      addText(s2.kindness);

      addLabel('Self-Compassion Phrase:');
      addText(s2.selfCompassionPhrase);

      addLabel('Shame Rating (after exercise):');
      addText(s2.shameRatingPost !== undefined ? s2.shameRatingPost + ' / 100' : '');
    }

    if (!hasStage1 && !hasStage2) {
      addText('No responses recorded yet.');
    }

    doc.save('My-Self-Compassion-Responses.pdf');
  }

  // Expose globally
  window.generatePdf = generatePdf;

  // Bind header button
  function bindBtn() {
    var btn = document.getElementById('downloadPdfBtn');
    if (btn) {
      btn.addEventListener('click', generatePdf);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindBtn);
  } else {
    bindBtn();
  }
})();
