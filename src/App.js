import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  font-weight: 800;
  color: black;
  font-size: 20px;
  width: 200px;
  cursor: pointer;
  box-shadow: 4px 4px 0px rgba(255,255,255,0.9);
  //box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  //-webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  //-moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

export const StyledVideo = styled.div`
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: -1;
  background-repeat: repeat-x;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 2) {
      newMintAmount = 2;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)", zIndex: 0 }}
      >
        <StyledVideo>
          <video autoPlay muted loop id="myVideo" style={{width: '100%' }}>
            <source src="/config/images/bg.mp4" type="video/mp4"></source>
          </video>
        </StyledVideo>

        <ResponsiveWrapper flex={1} test style={{maxWidth: '1000px',}}>
          {/*<s.Container flex={1} jc={"center"} ai={"center"}>*/}
          {/*  <StyledImg alt={"example"} src={"/config/images/example.gif"} />*/}
          {/*</s.Container>*/}



          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              // backgroundColor: "#2e292c",

              // backgroundColor: '#4158D0',
              // backgroundImage: 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',

              // backgroundColor: '#4158D0',
              // backgroundImage: 'linear-gradient(43deg, #4158D0 24%, #C850C0 70%, #FFCC70 100%)',

              // Picked from: https://cssgradient.io/gradient-backgrounds/
              backgroundColor: '#FF3CAC',
              backgroundImage: 'linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)',

              padding: 24,
              borderRadius: 24,
              boxShadow: '8px 8px 0px rgba(255,255,255,0.8)',

            }}
          >
            {/*<StyledLogo alt={"logo"} src={"/config/images/logo.png"} />*/}
            <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 70,
                  fontWeight: "900",
                  textShadow: `3px 3px 0px rgba(255,149,212,0.9)`,
                  fontStyle: 'italic',
                }}
            >
              Music Avatars
            </s.TextTitle>


            <s.SpacerSmall />

            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "BUY"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />



          {/*<s.Container flex={1} jc={"center"} ai={"center"}>*/}
          {/*  <StyledImg*/}
          {/*    alt={"example"}*/}
          {/*    src={"/config/images/example.gif"}*/}
          {/*    style={{ transform: "scaleX(-1)" }}*/}
          {/*  />*/}
          {/*</s.Container>*/}




        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"left"} style={{ width: "50%" }}>
         
          <s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >
            What are Music Avatars?  </s.TextDescription>

            <s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              fontSize: '18px',
            }}
          >
Music Avatars is a collection of 10,000 NFTs for artists who embody their instruments.  <br/><br/>

Each NFT is unique and consists of either a string instrument, mic, DJ set, synthesizer, or drum with distinct facial features. When you hold a Music Avatar NFT, you own all commercial and publishing rights associated with the image. Feel free to use it any way you like. <br/><br/>

</s.TextDescription>

<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >
 
What is the vision for Music Avatars? </s.TextDescription>


<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              fontSize: '18px',
            }}
          >

Music Avatars are designed to capture a moment where an artist/musician is one with their instrument. Hence, the instrument/mic with unique facial features. <br/>

We envision a future where strong brands are built upon Music Avatar NFTs by forward thinking artists/musicians who have become 1 with their NFT and choose to hold it forever. <br/>

We want every deserving artist to get a hold of a Music Avatar. <br/><br/></s.TextDescription>


<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >
What can I do with a Music Avatar? </s.TextDescription>



<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              fontSize: '18px',
            }}
          >
Music Avatars provide a unique visual and musical identity that makes you stand wherever a visual representation is required. As long as you hold a Music Avatar NFT, you can license it for use as the face of your brand, your online identity (profile picture), sold on T-shirts, advertisements, stickers, mugs, etc. and keep all the earnings for yourself.<br/><br/>
 
</s.TextDescription>

<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >

Who are Music Avatars for? </s.TextDescription>



<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              
              fontSize: '18px',
            }}
          >

Music Avatars are primarily geared towards artists and musicians but open to music lovers worldwide.<br/><br/></s.TextDescription>

<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: 'bold',
              fontSize: '40px',
            }}
          >
 
Which chain will these NFTs be on?  </s.TextDescription>


<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              fontSize: '18px',
            }}
          >
Music Avatars will be on the Ethereum blockchain. <br/><br/></s.TextDescription>

<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >
 
How much does it cost to mint a Music Avatar?  </s.TextDescription>


<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              
              fontSize: '18px',
            }}
          >
The public mint (9000 NFTs) is free. The public mint is scheduled for Sunday, December 19th 2021. <br/><br/></s.TextDescription>


<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >
 
How many can I mint for myself? </s.TextDescription>


<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              
              fontSize: '18px',
            }}
          >
 You are limited to 2 NFTs per address during the mint. <br/><br/></s.TextDescription>

 

<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >

 
How many Music Avatar are available for mint? </s.TextDescription>



<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              
              fontSize: '18px',
            }}
          >

There are 10,000 Music Avatars in total of which 9,000 are available for the free public mint and the rest reserved for the founding team/marketing.<br/><br/></s.TextDescription>
  


<s.TextDescription
            style={{
              textAlign: "left",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >

What started this project?  </s.TextDescription>



<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              
              fontSize: '18px',
            }}
          >

Kolourr (Bruce) started this project with the help of Donald Bough. Special thanks go out to Hashlips.<br/><br/></s.TextDescription>
            
         
<s.TextDescription
            style={{
              textAlign: "center",
              color: "white",
              fontWeight: '900',
              fontStyle: 'italic',
              fontSize: '40px',
            }}
          >

Note  </s.TextDescription>

<s.TextDescription
            style={{
              textAlign: "left",
              color: "var(--primary-text)",
              
              fontSize: '18px',
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action. We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>

          
          <s.SpacerSmall />
         
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
