import React, { useState } from "react";
import pptxgen from "pptxgenjs";
import {
  Grid, Card, Typography, TextField, InputAdornment, IconButton,
  List, ListItem, ListItemText, CircularProgress, Button, Box
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

function getDummySlides(topic) {
  return [
    { title: `Title: ${topic}`, description: `An overview of the presentation topic ${topic}.` },
    { title: `Introduction to ${topic}`, description: `Introducing the key concepts and background information about ${topic}.` },
    { title: `Why ${topic} Matters`, description: `Explains the importance and relevance of ${topic} in current times.` },
    { title: `History & Background of ${topic}`, description: `A brief history and origins of ${topic} to understand its development.` },
    { title: `Key Features of ${topic}`, description: `Details the main characteristics and unique aspects of ${topic}.` },
  ];
}

const generateAndUploadPpt = async (slides) => {
  const pptx = new pptxgen();
  slides.forEach(({ title, description }) => {
    let slide = pptx.addSlide();
    slide.addText(title || "Untitled", {
      x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "003366", w: 9, h: 1, align: "left"
    });
    slide.addText(description || "No Description", {
      x: 0.5, y: 1.5, fontSize: 14, color: "444444", w: 9, h: 3, align: "left", wrap: true
    });
  });
  const pptBlob = await pptx.write("blob");
  const file = new File([pptBlob], "slides.pptx", {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  });
  const formData = new FormData();
  formData.append("pptx", file);
  const res = await fetch("http://localhost:5000/upload-ppt", {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  return data.pptId;
};

function SlideGenerator() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [pptId, setPptId] = useState(null);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setSlides([]);
    setHasSubmitted(true);
    const dummySlides = getDummySlides(inputText);
    setSlides(dummySlides);
    const id = await generateAndUploadPpt(dummySlides);
    setPptId(id);
    setLoading(false);
  };

  return hasSubmitted ? (
    <Grid container style={{ minHeight: "100vh", padding: 16, alignItems: "stretch", display: "flex" }} spacing={2}>
      <Grid item xs={12} md={5} style={{ display: "flex" }}>
        <Card sx={{ p: 4, boxShadow: 3, width: "100%", height: "80vh", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Hello, piyuindia4!
          </Typography>
          <Typography sx={{ mb: 3 }}>
            What do you want me to generate today?
          </Typography>
          <TextField
            fullWidth variant="outlined"
            placeholder="Start with a topic, we'll turn it into slides!"
            value={inputText} onChange={(e) => setInputText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <AttachFileIcon />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary" onClick={handleSend} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : <SendIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ flex: 1, overflow: "auto", mt: 2 }}>
            {slides.length > 0 && (
              <List>
                {slides.map((slide, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={slide.title} secondary={slide.description} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Card>
      </Grid>

      {/* Right: PDF Preview */}
      <Grid item xs={12} md={6} style={{ display: "flex" }}>
        <Card sx={{ p: 4, boxShadow: 3, width: "100%", height: "80vh", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
          {pptId ? (
            <>
              <Typography variant="h6" gutterBottom>PPT Preview (PDF)</Typography>
              <iframe
                src={`http://localhost:5000/ppt-preview/${pptId}`}
                width="100%"
                height="600px"
                style={{ border: "1px solid #ccc" }}
                title="PPT PDF Preview"
              />
              <Button
                variant="contained"
                component="a"
                href={`http://localhost:5000/download-ppt/${pptId}`}
                download="Generated_Presentation.pptx"
                sx={{ mt: 2 }}
              >
                Download PPTX
              </Button>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">No presentation generated yet.</Typography>
          )}
        </Card>
      </Grid>
    </Grid>
  ) : (
    <Grid container style={{ minHeight: "100vh", padding: 16 }} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={5}>
        <Card sx={{ p: 4, boxShadow: 3, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Hello, piyuindia4!
          </Typography>
          <Typography sx={{ mb: 3 }}>
            What do you want me to generate today?
          </Typography>
          <TextField
            fullWidth variant="outlined"
            placeholder="Start with a topic, we'll turn it into slides!"
            value={inputText} onChange={(e) => setInputText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <AttachFileIcon />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary" onClick={handleSend} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : <SendIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Card>
      </Grid>
    </Grid>
  );
}

export default SlideGenerator;
