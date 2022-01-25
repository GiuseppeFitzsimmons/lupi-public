import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';

const useStyles = makeStyles({
  root: {
    maxWidth: 185,
    minWidth: 185,
    maxHeight: 105
  },
  media: {
    height: 60,
    margin: 0
  },
});

export default function GenericListView(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root} >
      <div style={{width:'100%',height:'1vh', background:props.colour?props.colour:'black'}}/>
      <CardActionArea>
        <CardMedia 
          onClick={props.onClick}
          className={classes.media}
          image={props.image}
        />
        <CardContent style={{padding:4}}>
          <Typography variant="h6" onClick={props.onClick}>
            {props.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {props.description}
          </Typography>
         {props.children}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}