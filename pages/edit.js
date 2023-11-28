import BackLink from "@/components/BackLink";
import styles from "@/styles/Edit.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Box, TextField, Typography } from "@mui/material";
import {
  deletePost,
  getPostById,
  postEntry,
  updatePost,
} from "../utils/db/post";

import {
  formatDateVerbose,
  formatNextDueDay,
  getNextCutoff,
} from "@/utils/dateHelper";
import { useCheckUser } from "@/utils/hooks";
import LoadingButton from "@mui/lab/LoadingButton";

import AlertDialog from "@/components/AlertDialog";
import Help from "@/components/Help";
import MonthPicker from "@/components/MonthPicker";
import { isYearValid } from "@/utils/validationHelper";

export default function Edit() {
  useCheckUser();
  const user = useSelector((state) => state.user.value);
  const userLoaded = useSelector((state) => state.user.loaded);

  const router = useRouter();
  const { postId } = router.query;

  useEffect(() => {
    if (userLoaded && !user) {
      router.push("/");
    }
  }, [router, user, userLoaded]);

  return (
    user && (
      <main className={styles.main}>
        <Typography
          variant="h2"
          noWrap
          component="a"
          sx={{
            fontWeight: 700,
            letterSpacing: ".3rem",
            padding: "1%",
          }}
        >
          Week of {formatNextDueDay()}
        </Typography>
        <PaperForm postId={postId} />
      </main>
    )
  );
}

function PaperForm({ postId }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const [titleError, setTitleError] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [authorError, setAuthorError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [yearError, setYearError] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);

  const [initialPost, setInitialPost] = useState({
    title: "",
    link: "",
    author: "",
    description: "",
    year: "",
    month: "",
  });

  const charLimit = 280;

  const user = useSelector((state) => state.user.value);
  const userId = useSelector((state) => state.user.id);
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [buttonText, setButtonText] = useState("Post");

  useEffect(() => {
    async function getPost(id) {
      const post = await getPostById(id);
      setTitle(post.title);
      setLink(post.link);
      setAuthor(post.author);
      setDescription(post.description);
      setYear(post.year);
      setMonth(post.month);
      setInitialPost(post);
      setButtonText("Update");
    }
    if (postId) getPost(postId);
  }, [postId]);

  const handleLinkChange = (event) => {
    setLink(event.target.value);
    setLinkError(event.target.value.length === 0);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    setTitleError(event.target.value.length === 0);
  };

  const handleAuthorChange = (event) => {
    setAuthor(event.target.value);
    setAuthorError(event.target.value.length === 0);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
    setDescriptionError(
      event.target.value.length === 0 || event.target.value.length > charLimit
    );
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
    setYearError(!isYearValid(event.target.value));
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (postId) {
      //update post
      await updatePost(title, link, author, description, year, month, postId);
      setLoading(false);
      router.push("/");
    } else {
      // create new post
      const newPostId = await postEntry(
        title,
        link,
        author,
        description,
        user.email,
        year,
        month,
        userId
      );
      setLoading(false);

      if (newPostId) {
        router.push("/");
      }
    }
  };

  function submitDisabled() {
    if (buttonText === "Post") {
      // month is optional
      return (
        linkError ||
        titleError ||
        authorError ||
        descriptionError ||
        yearError ||
        link === initialPost.link ||
        title === initialPost.title ||
        author === initialPost.author ||
        description === initialPost.description ||
        year === initialPost.year
      );
    }
    if (buttonText === "Update") {
      return (
        linkError ||
        titleError ||
        authorError ||
        descriptionError ||
        yearError ||
        (link === initialPost.link &&
          title === initialPost.title &&
          author === initialPost.author &&
          description === initialPost.description &&
          year === initialPost.year &&
          month === initialPost.month)
      );
    }
  }

  return (
    <div className={styles.form}>
      <TextField
        label="Link to paper"
        variant="outlined"
        fullWidth
        margin="normal"
        value={link}
        error={linkError}
        onChange={handleLinkChange}
      />
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        margin="normal"
        value={title}
        error={titleError}
        onChange={handleTitleChange}
      />
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        paddingTop="1rem"
        paddingBottom="0.5rem"
      >
        <TextField
          fullWidth
          label="Year"
          variant="outlined"
          sx={{ mr: "1rem" }}
          value={year}
          error={yearError}
          onChange={handleYearChange}
        />
        <MonthPicker month={month} onChange={handleMonthChange} />
      </Box>

      <TextField
        label="Author(s)"
        variant="outlined"
        fullWidth
        margin="normal"
        value={author}
        error={authorError}
        onChange={handleAuthorChange}
      />
      <TextField
        label="Description"
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        margin="normal"
        value={description}
        error={descriptionError}
        onChange={handleDescriptionChange}
      />
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        paddingRight="16px"
      >
        <Typography variant="body2" color="textSecondary">
          {`${description.length}/${charLimit}`}
        </Typography>
      </Box>

      <div>
        <LoadingButton
          className={styles.postButton}
          variant="contained"
          color="secondary"
          size="large"
          disabled={submitDisabled()}
          onClick={handleSubmit}
          loading={loading}
        >
          {buttonText}
        </LoadingButton>
        {buttonText === "Update" && (
          <LoadingButton
            className={styles.deleteButton}
            variant="outlined"
            color="error"
            size="large"
            onClick={() => setAlertOpen(true)}
            loading={loading}
          >
            Delete
          </LoadingButton>
        )}
        {alertOpen && (
          <AlertDialog
            open={alertOpen}
            handleClose={() => setAlertOpen(false)}
            handleAction={async () => {
              await deletePost(postId);
              setAlertOpen(false);
              router.push("/");
            }}
            text={"Are you sure you want to delete this post?"}
            contentText={
              "Once deleted, this post will not appear in the recommendation list for you and your network."
            }
            confirmButtonText={"Delete"}
          ></AlertDialog>
        )}
      </div>

      <div className={styles.infoText}>
        <Typography variant="body2" color="textSecondary">
          {`You can edit as many times as you want before this week's cutoff: ${formatDateVerbose(
            getNextCutoff()
          )}.`}
        </Typography>
        <Help />
      </div>

      <BackLink />
    </div>
  );
}
