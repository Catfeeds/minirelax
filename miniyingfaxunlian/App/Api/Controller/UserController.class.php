<?php
// 本类由系统自动生成，仅供测试用途
namespace Api\Controller;
use Think\Controller;
class UserController extends PublicController {

	//*********************************
	//  获取用户心得数和学习时长
	//*********************************
	public function getdata(){
		$uid = intval($_REQUEST['uid']);

		//获取会员今日总学习时长
		$todaystudy = M('listen_log')->where('uid='.intval($uid).' AND addtime>='.strtotime(date("Y-m-d")))->getField('SUM(longtime)');
		//获取会员总学习时长
		$totalstudy = M('listen_log')->where('uid='.intval($uid))->getField('SUM(longtime)');
		//获取笔记总数
		$study = M('study')->where('uid='.intval($uid))->getField('COUNT(id)');
		//获取问题数
		$question = M('question')->where('uid='.intval($uid))->getField('COUNT(id)');
		//获取mark总数
		$mark = M('mark')->where('uid='.intval($uid))->getField('COUNT(id)');
		//获取回答总数
		$answer = M('answer')->where('uid='.intval($uid))->getField('COUNT(id)');

		$data = array();
		$today = ceil($todaystudy/60);
		if ($today<=1 && $today>0) {
			$data['todaystudy'] = 1;
		}else{
			$data['todaystudy'] = intval($today);
		}
		$total = ceil($totalstudy/60);
		if ($total<=1 && $total>0) {
			$data['totalstudy'] = 1;
		}else{
			$data['totalstudy'] = intval($total);
		}

		$userinfo = M('user')->where('id='.intval($uid))->field('type,offtime,intro,is_qx,is_gl')->find();
		if (intval($userinfo['type'])>1) {
			$data['type'] = 2;
			$data['offtime'] = date("Y-m-d",$userinfo['offtime']);
		}else{
			$data['type'] = 1;
			$data['offtime'] = 0;
		}

		$data['study'] = intval($study);
		$data['question'] = intval($question);
		$data['mark'] = intval($mark);
		$data['answer'] = intval($answer);
		$data['intro'] = $userinfo['intro'];
		$data['is_qx'] = intval($userinfo['is_qx']);
		$data['is_gl'] = intval($userinfo['is_gl']);
		echo json_encode(array('status'=>1,'info'=>$data));
		exit();
	}


	//***************************
	//  获取用户信息
	//***************************
	public function userinfo () {
		$uid = intval($_REQUEST['uid']);
		$user = M("user")->where('id='.intval($uid).' AND del=0')->find();
		if (!$user) {
			echo json_encode(array('status'=>0,'err'=>'用户信息异常.'));
			exit();
		}

		//计算会员发布问题的天数
		$days = M('question')->where('uid='.intval($uid))->group("FROM_UNIXTIME(addtime, '%Y%m%d')")->select();
		$user['days'] = intval(count($days));
		$sdays = intval(100-intval($user['days']));
		if ($sdays<0) {
			$user['sdays'] = 0;
		} else {
			$user['sdays'] = $sdays;
		}

		//计算会员发布的笔记篇数
		$notes = M('study')->where('uid='.intval($uid).' AND audit=1')->group("FROM_UNIXTIME(addtime, '%Y%m%d')")->select();
		$user['notenum'] = intval(count($notes));
		$snotenum = intval(120-intval($user['notenum']));
		if ($snotenum<0) {
			$user['snotenum'] = 0;
		} else {
			$user['snotenum'] = $snotenum;
		}

		//获取笔记总数
		$user['study'] = intval(M('study')->where('uid='.intval($uid).' AND audit=1')->getField('COUNT(id)'));
		//获取问题数
		$user['question'] = intval(M('question')->where('uid='.intval($uid))->getField('COUNT(id)'));
		//获取mark总数
		$user['mark'] = intval(M('mark')->where('uid='.intval($uid))->getField('COUNT(id)'));
		//获取回答总数
		$user['answer'] = intval(M('answer')->where('uid='.intval($uid))->getField('COUNT(id)'));

		echo json_encode(array('status'=>1,'userinfo'=>$user));
		exit();
		
	}

	//***************************
	//  获取 支付按钮显示状态
	//***************************
	public function getstate(){
		echo json_encode(array('openstate'=>1));
		exit();
		
	}

	//***************************
	//  修改用户信息
	//***************************
	public function user_edit(){
			$user_id=intval($_REQUEST['uid']);
			$user_info = M('user')->where('id='.intval($user_id).' AND del=0')->find();
			if (!$user_info) {
				echo json_encode(array('status'=>0,'err'=>'状态异常.'));
				exit();
			}

			$data = array();
			$data['intro'] = $_POST['content'];

			$result=M("user")->where('id='.intval($user_id))->save($data);
		    if($result){
				echo json_encode(array('status'=>1));
				exit();
			}else{
				echo json_encode(array('status'=>0,'err'=>'保存失败.'));
				exit();
			}
	}

	//*********************************
	//  会员收听 播放和暂停时 记录
	//*********************************
	public function recordlog(){
		$uid = intval($_REQUEST['uid']);
		$pro_id = intval($_REQUEST['play_id']);
		$thetime = trim($_REQUEST['thetime']);
		$arr = explode(':', $thetime);
		$longtime = intval(intval($arr[0])*60)+intval($arr[1]);

		$check = M('listen_log')->where('uid='.intval($uid).' AND pro_id='.intval($pro_id).' AND addtime>='.strtotime(date('Y-m-d')))->order('addtime desc')->limit(1)->find();
		$up = array();
		if ($check && intval($check['is_over'])==0) {
			if (intval($check['longtime'])<intval($longtime)) {
				$up['longtime'] = intval($longtime);
			}
			M('listen_log')->where('uid='.intval($uid).' AND pro_id='.intval($pro_id))->save($up);
		}else{
			$up['uid'] = intval($uid);
			$up['pro_id'] = intval($pro_id);
			$up['longtime'] = intval($longtime);
			$up['addtime'] = time();
			$up['name'] = M('product')->where('id='.intval($pro_id))->getField('name');
			M('listen_log')->add($up);
		}
	}

	//***************************
	//  会员收听完后的记录
	//***************************
	public function recordlogover(){
		$uid = intval($_REQUEST['uid']);
		$pro_id = intval($_REQUEST['play_id']);
		$arr = explode(':', trim($_REQUEST['longtime']));
		$longtime = intval(intval($arr[0])*60)+intval($arr[1]);

		$check = M('listen_log')->where('uid='.intval($uid).' AND pro_id='.intval($pro_id).' AND addtime>='.strtotime(date("Y-m-d")))->order('addtime desc')->limit(1)->find();
		$up = array();
		$up['is_over'] = 1;
		$up['longtime'] = intval($longtime);
		$up['addtime'] = time();
		if (intval($longtime)>0) {
			if ($check && intval($check['is_over'])==0) {
				M('listen_log')->where('id='.intval($check['id']))->save($up);
			}else{
				$up['uid'] = intval($uid);
				$up['pro_id'] = intval($pro_id);
				$up['name'] = M('product')->where('id='.intval($pro_id))->getField('name');
				M('listen_log')->add($up);
			}
		}
	}

	//**********************************
	//  会员记录 上一条的最后收听记录
	//**********************************
	public function recordlogold(){
		$uid = intval($_REQUEST['uid']);
		$pro_id = intval($_REQUEST['play_id']);
		$arr = explode(':', trim($_REQUEST['currtime']));
		$longtime = intval(intval($arr[0])*60)+intval($arr[1]);

		$check = M('listen_log')->where('uid='.intval($uid).' AND pro_id='.intval($pro_id).' AND is_over=0 AND addtime>='.strtotime(date("Y-m-d")))->order('addtime desc')->limit(1)->find();
		$up = array();
		$up['addtime'] = time();
		if ($check) {
			if (intval($check['longtime'])<intval($longtime)) {
				$up['longtime'] = intval($longtime);
			}
			M('listen_log')->where('id='.intval($check['id']))->save($up);
		}else{
			$up['uid'] = intval($uid);
			$up['pro_id'] = intval($pro_id);
			$up['longtime'] = intval($longtime);
			$up['name'] = M('product')->where('id='.intval($pro_id))->getField('name');
			M('listen_log')->add($up);
		}
	}

	//***************************
	//  保存会员的心得信息
	//***************************
	public function study(){
		$uid = intval($_REQUEST['uid']);
		$user = M("user")->where('id='.intval($uid).' AND del=0')->find();
		if (!$user) {
			echo json_encode(array('status'=>0,'err'=>'用户信息异常.'));
			exit();
		}

		$htype = trim($_REQUEST['htype']);
		$pro_id = intval($_REQUEST['pro_id']);
		if ($htype!='vclass') {
			if (!$pro_id) {
				echo json_encode(array('status'=>0,'err'=>'网络错误.'));
				exit();
			}
		}

		$content = $_POST['content'];
		if (!$content) {
			echo json_encode(array('status'=>0,'err'=>'请输入心得内容.'));
			exit();
		}

		$adv_img = '';
		$img1 = trim($_REQUEST['adv1']);
		if ($img1) {
			$adv_img .= ','.$img1;
		}
		$img2 = trim($_REQUEST['adv2']);
		if ($img2) {
			$adv_img .= ','.$img2;
		}
		$img3 = trim($_REQUEST['adv3']);
		if ($img3) {
			$adv_img .= ','.$img3;
		}

		$data = array();
		$data['uid'] = $uid;
		$data['pro_id'] = $pro_id;
		$data['content'] = $content;
		$data['adv_img'] = $adv_img;
		$data['addtime'] = time();
		$btype = intval($_REQUEST['btype']);
		if ($btype==2) {
			$data['audit'] = 1;
			$data['audit_time'] = time();
		}

		$res = M('study')->add($data);
		if ($res) {
			echo json_encode(array('status'=>1));
			exit();
		}else{
			echo json_encode(array('status'=>0,'err'=>'保存失败.'));
			exit();
		}
	}

	//***************************
	//  获取所有会员心得列表
	//***************************
	public function study_list(){
		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*10)-10;

 		$list = M('study')->where('1=1 AND audit>0')->order('audit_time desc')->limit($limit.',10')->select();
 		foreach ($list as $k => $v) {
 			$uinfo = M('user')->where('id='.intval($v['uid']))->find();
 			$list[$k]['avatar'] = $uinfo['photo'];
 			$list[$k]['uname'] = $uinfo['name'];
 			$list[$k]['utype'] = $uinfo['type'];
 			$list[$k]['pname'] = M('product')->where('id='.intval($v['pro_id']))->getField('name');
 			//处理时间
 			$timenum = intval(time()-$v['addtime']);
            $tian = ceil($timenum/86400);
            $xiaoshi = ceil($timenum/3600);
            $fenzhong = ceil($timenum/60);
            if (intval($tian)>1) {
                if (intval($tian)>3) {
                    $list[$k]['desc'] = date("Y-m-d",$v['addtime']);
                }else{
                    $list[$k]['desc'] = intval($tian).'天前';
                }
            }elseif (intval($xiaoshi)>1) {
                $list[$k]['desc'] = intval($xiaoshi).'小时前';
            }elseif (intval($fenzhong)>1) {
                $list[$k]['desc'] = intval($fenzhong).'分钟前';
            }else{
                $list[$k]['desc'] = intval($timenum).'秒前';
            }
            //处理图片
            $imgarr = explode(',', trim($v['adv_img'],','));
            if ($imgarr[0]) {
            	$list[$k]['adv1'] = __DATAURL__.$imgarr[0];
            }
            if ($imgarr[1]) {
            	$list[$k]['adv2'] = __DATAURL__.$imgarr[1];
            }
            if ($imgarr[2]) {
            	$list[$k]['adv3'] = __DATAURL__.$imgarr[2];
            }
 		}

 		$is_qx = M('user')->where('id='.intval($_REQUEST['uid']))->getField('is_qx');

 		echo json_encode(array('status'=>1,'list'=>$list,'is_qx'=>intval($is_qx)));
 		exit();
	}

	//***************************
	//  获取所有会员心得列表
	//***************************
	public function study_detail(){
		$uid = intval($_REQUEST['uid']);
		$sid = intval($_REQUEST['sid']);

 		$info = M('study')->where('id='.intval($sid))->find();
 		if (!$info) {
 			echo json_encode(array('status'=>0));
 			exit();
 		}

 		$uinfo = M('user')->where('id='.intval($info['uid']))->find();
 		$info['avatar'] = $uinfo['photo'];
 		$info['uname'] = $uinfo['name'];
 		$info['utype'] = $uinfo['type'];
 		$info['pname'] = M('product')->where('id='.intval($info['pro_id']))->getField('name');
 		//处理时间
 		$timenum = intval(time()-$info['addtime']);
        $tian = ceil($timenum/86400);
        $xiaoshi = ceil($timenum/3600);
        $fenzhong = ceil($timenum/60);
        if (intval($tian)>1) {
            if (intval($tian)>3) {
                $info['desc'] = date("m-d",$info['addtime']);
            }else{
                $info['desc'] = intval($tian).'天前';
            }
        }elseif (intval($xiaoshi)>0) {
            $info['desc'] = intval($xiaoshi).'小时前';
        }elseif (intval($fenzhong)>0) {
            $info['desc'] = intval($fenzhong).'分钟前';
        }else{
            $info['desc'] = intval($timenum).'秒前';
        }
        //处理图片
        $imgarr = explode(',', trim($info['adv_img'],','));
        if ($imgarr[0]) {
           	$info['adv1'] = __DATAURL__.$imgarr[0];
        }
        if ($imgarr[1]) {
            $info['adv2'] = __DATAURL__.$imgarr[1];
        }
        if ($imgarr[2]) {
           	$info['adv3'] = __DATAURL__.$imgarr[2];
        }

 		$is_qx = M('user')->where('id='.intval($uid))->getField('is_qx');
 		$is_gl = M('user')->where('id='.intval($uid))->getField('is_gl');

 		//获取所有笔记的回复内容
 		$list = M('study_ans')->where('sid='.intval($sid))->select();
 		foreach ($list as $k => $v) {
 			$user = M('user')->where('id='.intval($v['uid']))->find();
            $list[$k]['avatar'] = $user['photo'];
            $list[$k]['uname'] = $user['name'];
            $list[$k]['utype'] = intval($user['type']);
            $list[$k]['reply_time'] = date("Y-m-d H:i",$v['reply_time']);
 		}

 		echo json_encode(array('status'=>1,'info'=>$info,'list'=>$list,'is_qx'=>intval($is_qx),'is_gl'=>intval($is_gl)));
 		exit();
	}

	//***************************
	//  保存笔记点评内容
	//***************************
	public function savestudyans() {
		$uid = intval($_REQUEST['uid']);
		$userinfo = M('user')->where('id='.intval($uid).' AND del=0')->find();
		if (!$userinfo) {
			echo json_encode(array('status'=>0,'err'=>'用户信息异常！'));
			exit();
		}

		if (intval($userinfo['is_qx'])!=1) {
			echo json_encode(array('status'=>0,'err'=>'您还没有回答问题的权限哦！'));
			exit();
		}

		$sid = intval($_REQUEST['sid']);
		$check = M('study')->where('id='.intval($sid))->find();
		if (!$check) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		$content = $_POST['content'];
		if (!$content) {
			echo json_encode(array('status'=>0,'err'=>'请输入你要点评的内容！'));
			exit();
		}

		$data = array();
		$data['uid'] = intval($uid);
		$data['sid'] = intval($sid);
		$data['reply_con'] = $content;
		$data['reply_time'] = time();
		$res = M('study_ans')->add($data);
		if ($res) {
			echo json_encode(array('status'=>1));
			exit();
		} else {
			echo json_encode(array('status'=>0,'err'=>'提交失败！'));
			exit();
		}
	}

	//***************************
	//  会员删除自己的笔记
	//***************************
	public function delstudy() {
		$uid = intval($_REQUEST['uid']);
		$sid = intval($_REQUEST['sid']);
		$check = M('study')->where('id='.intval($sid).' AND uid='.intval($uid))->getField('id');
		if (!intval($check)) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		$res = M('study')->where('id='.intval($sid).' AND uid='.intval($uid))->delete();
		if ($res) {
			//删除所有的点评
			M('study_ans')->where('sid='.intval($sid))->delete();
			echo json_encode(array('status'=>1));
			exit();

		} else {
			echo json_encode(array('status'=>0,'err'=>'操作失败！.'));
			exit();
		}
	}

	//***************************
	//  回答者删除自己的笔记点评
	//***************************
	public function delstudyans() {
		$uid = intval($_REQUEST['uid']);
		$ansid = intval($_REQUEST['ansid']);
		$check = M('study_ans')->where('id='.intval($ansid).' AND uid='.intval($uid))->getField('id');
		if (!intval($check)) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		$res = M('study_ans')->where('id='.intval($ansid).' AND uid='.intval($uid))->delete();
		if ($res) {
			echo json_encode(array('status'=>1));
			exit();
		} else {
			echo json_encode(array('status'=>0,'err'=>'操作失败！.'));
			exit();
		}
	}

	//***************************
	//  checked VIP会员笔记
	//***************************
	public function checked() {
		$uid = intval($_REQUEST['uid']);
		$uinfo = M('user')->where('id='.intval($uid).' AND del=0')->find();
		if (!$uinfo) {
			echo json_encode(array('status'=>0,'err'=>'操作会员信息异常.'));
			exit();
		}

		$id = intval($_REQUEST['id']);
		$sinfo = M('study')->where('id='.intval($id))->find();
		if (!$sinfo) {
			echo json_encode(array('status'=>0,'err'=>'会员笔记信息异常.'));
			exit();
		}

		//判断会员权限
		if (intval($uinfo['is_qx'])!=1) {
			echo json_encode(array('status'=>0,'err'=>'权限不足.'));
			exit();
		}

		if (intval($sinfo['checked'])==1) {
			echo json_encode(array('status'=>1));
			exit();
		}

		$res = M('study')->where('id='.intval($id))->save(array('checked'=>1));
		if ($res) {
			echo json_encode(array('status'=>1));
			exit();
		} else {
			echo json_encode(array('status'=>0,'err'=>'操作失败.'));
			exit();
		}
	}

	//***************************
	//  获取所有会员心得列表
	//***************************
	public function mystudy(){
		$where = array();
		$uid = intval($_REQUEST['uid']);
		$where['uid'] = $uid;	
		$stype = trim($_REQUEST['stype']);
		if ($stype && $stype=='show') {
			$where['audit'] = array('gt',0);
		}

		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*10)-10;

 		$list = M('study')->where($where)->order('addtime desc')->limit($limit.',10')->select();
 		foreach ($list as $k => $v) {
 			$info = M('user')->where('id='.intval($v['uid']))->find();
 			$list[$k]['avatar'] = $info['photo'];
 			$list[$k]['uname'] = $info['name'];
 			$list[$k]['utype'] = $info['type'];
 			$list[$k]['pname'] = M('product')->where('id='.intval($v['pro_id']))->getField('name');
 			//处理时间
            $list[$k]['desc'] = date("m-d H:i",$v['addtime']);

            //处理图片
            $imgarr = explode(',', trim($v['adv_img'],','));
            if ($imgarr[0]) {
            	$list[$k]['adv1'] = __DATAURL__.$imgarr[0];
            }
            if ($imgarr[1]) {
            	$list[$k]['adv2'] = __DATAURL__.$imgarr[1];
            }
            if ($imgarr[2]) {
            	$list[$k]['adv3'] = __DATAURL__.$imgarr[2];
            }
 		}

 		//获取所有日期
 		$dlist = M('study')->where($where)->order('addtime desc')->group('FROM_UNIXTIME(addtime,"%Y-%m-%d")')->field('addtime,FROM_UNIXTIME(addtime,"%Y-%m-%d") AS dates')->select();

 		echo json_encode(array('status'=>1,'list'=>$list,'dlist'=>$dlist));
 		exit();
	}

	//***************************
	//  获取所有会员问题
	//***************************
	public function myquestion(){
		$uid = intval($_REQUEST['uid']);
		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*10)-10;

 		$list = M('question')->where('1=1 AND uid='.intval($uid))->order('addtime desc')->limit($limit.',10')->select();
 		foreach ($list as $k => $v) {
 			$info = M('user')->where('id='.intval($v['uid']))->find();
 			$list[$k]['avatar'] = $info['photo'];
 			$list[$k]['uname'] = $info['name'];
 			$list[$k]['utype'] = $info['type'];
 			//处理时间
            $list[$k]['desc'] = date("m-d H:i",$v['addtime']);
            $list[$k]['pro_name'] = M('product')->where('id='.intval($v['pro_id']))->getField('name');
 		}

 		//获取所有日期
 		$dlist = M('question')->where('1=1 AND uid='.intval($uid))->order('addtime desc')->group('FROM_UNIXTIME(addtime,"%Y-%m-%d")')->field('addtime,FROM_UNIXTIME(addtime,"%Y-%m-%d") AS dates')->select();

 		echo json_encode(array('status'=>1,'list'=>$list,'dlist'=>$dlist));
 		exit();
	}

	//***************************
	//  会员删除自己的笔记
	//***************************
	public function delquestion() {
		$uid = intval($_REQUEST['uid']);
		$qid = intval($_REQUEST['qid']);
		$check = M('question')->where('id='.intval($qid))->getField('id');
		if (!intval($check)) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		$res = M('question')->where('id='.intval($qid))->delete();
		if ($res) {
			//删除所有的回答还有追问追答
			M('answer')->where('reply_id='.intval($qid))->delete();
			M('ask')->where('qid='.intval($qid))->delete();
			echo json_encode(array('status'=>1));
			exit();

		} else {
			echo json_encode(array('status'=>0,'err'=>'操作失败！'));
			exit();
		}
	}

	//***************************
	//  获取所有会员mark
	//***************************
	public function mymark(){
		$uid = intval($_REQUEST['uid']);
		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*10)-10;

 		$list = M('mark')->where('1=1 AND uid='.intval($uid))->order('addtime desc')->limit($limit.',10')->select();
 		foreach ($list as $k => $v) {
 			$theuid = intval(M('question')->where('id='.intval($v['qid']))->getField('uid'));
 			$list[$k]['avatar'] = M('user')->where('id='.intval($theuid))->getField('photo');
 			$list[$k]['uname'] = M('user')->where('id='.intval($theuid))->getField('name');
 			$list[$k]['utype'] = M('user')->where('id='.intval($theuid))->getField('type');
 			$list[$k]['content'] = M('question')->where('id='.intval($v['qid']))->getField('content');
 			//处理时间
            $list[$k]['desc'] = date("m-d H:i",$v['addtime']);
 		}
 		echo json_encode(array('status'=>1,'list'=>$list));
 		exit();
	}

	//************************************
	//  获取所有回答者已回答的问题
	//************************************
	public function myanswer(){
		$uid = intval($_REQUEST['uid']);
		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=1;
 		}
 		$limit = intval($page*10)-10;

 		$list = M('answer')->where('1=1 AND uid='.intval($uid))->order('reply_time desc')->limit($limit.',10')->select();
 		foreach ($list as $k => $v) {
 			$theuid = intval(M('question')->where('id='.intval($v['reply_id']))->getField('uid'));
 			$info = M('user')->where('id='.intval($theuid))->find();
 			$list[$k]['theuid'] = $theuid;
 			$list[$k]['avatar'] = $info['photo'];
 			$list[$k]['uname'] = $info['name'];
 			$list[$k]['utype'] = $info['type'];
 			$list[$k]['content'] = M('question')->where('id='.intval($v['reply_id']))->getField('content');
 			//处理时间
            $list[$k]['desc'] = date("m-d H:i",M('question')->where('id='.intval($v['reply_id']))->getField('addtime'));
 		}
 		echo json_encode(array('status'=>1,'list'=>$list));
 		exit();
	}

	//***************************
	// 会员发布笔记
	//***************************
	public function study_edit(){
		$uid = intval($_POST['uid']);
		$pro_id = intval($_POST['pro_id']);
		if (!$uid || !$pro_id) {
			echo json_encode(array('status'=>0,'err'=>'参数错误！'));
 			exit();
		}

		$check_info = M('study')->where('id='.intval($pro_id))->find();
		if (!$check_info) {
			echo json_encode(array('status'=>0,'err'=>'没有找到要发布的笔记！'));
 			exit();
		}

		if (intval($check_info['audit'])>0 && $check_info['audit_time']>0) {
			echo json_encode(array('status'=>0,'err'=>'该笔记已发布！'));
 			exit();
		}

		$data = array();
		$data['audit'] = 1;
		$data['audit_time'] = time();
		$res = M('study')->where('id='.intval($pro_id))->save($data);
		if ($res) {
			echo json_encode(array('status'=>1));
 			exit();
		}else{
			echo json_encode(array('status'=>0,'err'=>'发布失败，请稍后再试！'));
 			exit();
		}
	}

	//***************************
	// 上传心得图片
	//***************************
	public function uploadimg(){
		$info = $this->upload_images($_FILES['img'],array('jpg','png','jpeg'),"study/".date(Ymd));
		if(is_array($info)) {// 上传错误提示错误信息
			$url = 'UploadFiles/'.$info['savepath'].$info['savename'];
			$xt = $_REQUEST['imgs'];
			if ($xt) {
				$img_url = "Data/".$xt;
				if(file_exists($img_url)) {
					@unlink($img_url);
				}
			}
			echo $url;
			exit();
		}else{
			echo json_encode(array('status'=>0,'err'=>$info));
			exit();
		}
	}

	//***************************
	// 会员发布问题
	//***************************
	public function savequestion () {
		$uid = intval($_REQUEST['uid']);
		$userinfo = M('user')->where('id='.intval($uid).' AND del=0')->find();
		if (!$userinfo) {
			echo json_encode(array('status'=>0,'err'=>'用户信息异常！'));
			exit();
		}

		$content = $_POST['content'];
		if (!$content) {
			echo json_encode(array('status'=>0,'err'=>'请输入你要发布的问题！'));
			exit();
		}

		$qtype = 1;
		if (intval($_REQUEST['qtype'])) {
			$qtype = intval($_REQUEST['qtype']);
		}

		$proid = intval($_REQUEST['proid']);
		if ($proid>0) {
			$cid = M('product')->where('id='.intval($proid))->getField('cid');
			$cattype = M('pro_cat')->where('id='.intval($cid))->getField('cattype');
		}

		//获取会员发布问题的总数
        $nums = intval(M('question')->where('uid='.intval($uid))->getField('COUNT(id)'));
        if (intval($userinfo['type'])<=1 && $nums>=20) {
        	echo json_encode(array('status'=>0,'err'=>'您的免费提问次数已用完了哦！'));
			exit();
        }

		$data = array();
		$data['uid'] = intval($uid);
		$data['content'] = $content;
		$data['qtype'] = $qtype;
		$data['pro_id'] = $proid;
		$data['addtime'] = time();
		$res = M('question')->add($data);
		if ($res) {
			echo json_encode(array('status'=>1));
			exit();
		} else {
			echo json_encode(array('status'=>0,'err'=>'保存失败！'));
			exit();
		}
	}

	//***************************
	// 获取会员发布的问题
	//***************************
	public function getquestion () {
		$uid = intval($_REQUEST['uid']);
		if (!$uid) {
			echo json_encode(array('status'=>0,'err'=>'登录状态异常！'));
			exit();
		}

		$qid = $_POST['qid'];
		$info = M('question')->where('id='.intval($qid))->find();
		if (!$info) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		if (intval($info['uid'])==intval($uid)) {
			if (intval($info['num'])>0) {
				M('question')->where('id='.intval($qid))->save(array('num'=>0));
			}
		}

		$user = M('user')->where('id='.intval($info['uid']))->find();
        $info['avatar'] = $user['photo'];
        $info['name'] = $user['name'];
        $info['utype'] = intval($user['type']);
        $info['addtime'] = date("Y-m-d H:i",$info['addtime']);
        $info['pro_name'] = M('product')->where('id='.intval($info['pro_id']))->getField('name');
        $info['re_count'] = intval(M('answer')->where('reply_id='.intval($qid))->getField('COUNT(id)'));

        //获取所有回复数据
        $list = M('answer')->where('1=1 AND reply_id='.intval($qid))->order('reply_time desc')->select();
        foreach ($list as $k => $v) {
        	$user = M('user')->where('id='.intval($v['uid']))->find();
            $list[$k]['avatar'] = $user['photo'];
            $list[$k]['name'] = $user['name'];
            $list[$k]['utype'] = intval($user['type']);
            $list[$k]['reply_time'] = date("Y-m-d H:i",$v['reply_time']);
            //判断是否有追问追答
            $zhui = M('ask')->where('del=0 AND qid='.intval($qid).' AND aid='.intval($v['id']))->find();
            if ($zhui) {
            	$list[$k]['zhui'] = 1;
            	$list[$k]['askid'] = intval($zhui['id']);
            	$list[$k]['ask_content'] = $zhui['ask_content'];
            	$list[$k]['ask_state'] = intval($zhui['ask_state']);
            	$list[$k]['ans_content'] = $zhui['ans_content'];
            } else {
            	$list[$k]['zhui'] = 0;
            	$list[$k]['askid'] = 0;
            	$list[$k]['ask_content'] = '';
            	$list[$k]['ask_state'] = 0;
            	$list[$k]['ans_content'] = '';
            }
        }

        //判断登录会员是否有回答问题的权限
        $is_qx = M('user')->where('id='.intval($uid))->getField('is_qx');
        //判断登录会员是否有管理的权限
        $is_gl = M('user')->where('id='.intval($uid))->getField('is_gl');

        //判断会员是否mark
        $mark = M('mark')->where('uid='.intval($uid).' AND qid='.intval($qid))->getField('id');
        if (intval($mark)>0) {
        	$is_mark = 1;
        } else {
        	$is_mark = 0;
        }
        echo json_encode(array('status'=>1,'is_qx'=>intval($is_qx),'is_gl'=>intval($is_gl),'info'=>$info,'list'=>$list,'mark'=>$is_mark));
        exit();
	}

	//*********************************
	//  回答者删除自己的笔记点评
	//*********************************
	public function delanswer() {
		$uid = intval($_REQUEST['uid']);
		$userinfo = M('user')->where('id='.intval($uid).' AND del=0')->find();
		if (!$userinfo || intval($userinfo['is_qx'])!=1) {
			echo json_encode(array('status'=>0,'err'=>'权限不足，无法执行此操作！'));
			exit();
		}

		$aid = intval($_REQUEST['aid']);
		$check = M('answer')->where('id='.intval($aid))->getField('id');
		if (!intval($check)) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		$res = M('answer')->where('id='.intval($aid))->delete();
		if ($res) {
			M('ask')->where('aid='.intval($aid))->save(array('del'=>1));
			echo json_encode(array('status'=>1));
			exit();
		} else {
			echo json_encode(array('status'=>0,'err'=>'操作失败！'));
			exit();
		}
	}

	//***************************
	// 会员  mark
	//***************************
	public function mark() {
		$uid = intval($_REQUEST['uid']);
		$qid = intval($_REQUEST['qid']);
		if (!$uid || !$qid) {
			echo json_encode(array('status'=>0,'err'=>'参数错误！'));
			exit();
		}

		$check = M('mark')->where('uid='.intval($uid).' AND qid='.intval($qid))->find();
		if ($check) {
			$res = M('mark')->where('id='.intval($check['id']))->delete();
		}else{
			$add = array();
			$add['uid'] = $uid;
			$add['qid'] = $qid;
			$add['addtime'] = time();
			$res = M('mark')->add($add);
		}

		if ($res) {
			echo json_encode(array('status'=>1));
			exit();
		} else {
			echo json_encode(array('status'=>0,'err'=>'操作失败！'));
			exit();
		}
	}

	//***************************
	// 获取会员发布的问题
	//***************************
	public function getmorelist () {
		$uid = intval($_REQUEST['uid']);
		if (!$uid) {
			echo json_encode(array('status'=>0,'err'=>'登录状态异常！'));
			exit();
		}

		$qid = $_POST['qid'];
		$info = M('question')->where('id='.intval($qid))->find();
		if (!$info) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		//分页
		$page = intval($_REQUEST['page']);
		if (!$page) {
			$page = 2;
		}
		$limit = intval($page)*10-10;

        //获取所有回复数据
        $list = M('answer')->where('1=1 AND reply_id='.intval($qid))->order('reply_time desc')->limit($limit.',10')->select();
        foreach ($list as $k => $v) {
        	$user = M('user')->where('id='.intval($v['uid']))->find();
            $list[$k]['avatar'] = $user['photo'];
            $list[$k]['name'] = $user['name'];
            $list[$k]['utype'] = intval($user['type']);
            $list[$k]['reply_time'] = date("Y-m-d H:i",$v['reply_time']);
        }

        echo json_encode(array('status'=>1,'list'=>$list));
        exit();
	}

	//***************************
	// 会员发布问题
	//***************************
	public function saveanswer () {
		$uid = intval($_REQUEST['uid']);
		$userinfo = M('user')->where('id='.intval($uid).' AND del=0')->find();
		if (!$userinfo) {
			echo json_encode(array('status'=>0,'err'=>'用户信息异常！'));
			exit();
		}

		if (intval($userinfo['is_qx'])!=1) {
			echo json_encode(array('status'=>0,'err'=>'您还没有回答问题的权限哦！'));
			exit();
		}

		$qid = intval($_REQUEST['qid']);
		$check = M('question')->where('id='.intval($qid))->find();
		if (!$check) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		$content = $_POST['content'];
		if (!$content) {
			echo json_encode(array('status'=>0,'err'=>'请输入你要回复的内容！'));
			exit();
		}

		$data = array();
		$data['uid'] = intval($uid);
		$data['reply_id'] = intval($qid);
		$data['reply_con'] = $content;
		$data['reply_time'] = time();
		$res = M('answer')->add($data);
		if ($res) {
			M('question')->where('id='.intval($qid))->save(array('num'=>intval($check['num'])+1));
			echo json_encode(array('status'=>1));
			exit();
		} else {
			echo json_encode(array('status'=>0,'err'=>'提交失败！'));
			exit();
		}
	}

	//***************************
	// 会员 保存追问追答
	//***************************
	public function saveask () {
		$uid = intval($_REQUEST['uid']);
		$userinfo = M('user')->where('id='.intval($uid).' AND del=0')->find();
		if (!$userinfo) {
			echo json_encode(array('status'=>0,'err'=>'用户信息异常！'));
			exit();
		}

		$savetype = intval($_REQUEST['savetype']);
		$qid = intval($_REQUEST['qid']);
		$check = M('question')->where('id='.intval($qid))->find();
		if (!$check) {
			echo json_encode(array('status'=>0,'err'=>'数据信息异常！'));
			exit();
		}

		$content = $_POST['content'];
		if (!$content) {
			echo json_encode(array('status'=>0,'err'=>'请输入你要回复的内容！'));
			exit();
		}

		if ($savetype==2) {
			// 保存追问内容
			if ($uid!=intval($check['uid'])) {
				echo json_encode(array('status'=>0,'err'=>'系统错误！'));
				exit();
			}
			$aid = intval($_REQUEST['aid']);
			$check_ask = M('ask')->where('del=0 AND qid='.intval($qid).' AND aid='.intval($aid))->find();
			if ($check_ask) {
				echo json_encode(array('status'=>0,'err'=>'您已经追问过了！'));
				exit();
			}

			$data = array();
			$data['uid'] = intval($uid);
			$data['qid'] = intval($qid);
			$data['aid'] = intval($aid);
			$data['ask_content'] = $content;
			$data['ask_time'] = time();
			$res = M('ask')->add($data);

		} elseif ($savetype==3) {
			if (intval($userinfo['is_qx'])!=1) {
				echo json_encode(array('status'=>0,'err'=>'您没有回答的权限哦！'));
				exit();
			}
			$askid = intval($_REQUEST['askid']);
			$check_ask = M('ask')->where('del=0 AND id='.intval($askid))->find();
			if (!$check_ask) {
				echo json_encode(array('status'=>0,'err'=>'系统错误！error'));
				exit();
			}

			if (intval($check_ask['ask_state'])==1) {
				echo json_encode(array('status'=>0,'err'=>'问题已回答！'));
				exit();
			}

			$data = array();
			$data['auid'] = $uid;
			$data['ask_state'] = 1;
			$data['ans_content'] = $content;
			$data['ans_time'] = time();
			$res = M('ask')->where('id='.intval($askid))->save($data);
		}

		if ($res) {
			echo json_encode(array('status'=>1));
			exit();
		} else {
			echo json_encode(array('status'=>0,'err'=>'操作失败！'));
			exit();
		}
	}
		
	/*
	*
	* 图片上传的公共方法
	*  $file 文件数据流 $exts 文件类型 $path 子目录名称
	*/
	public function upload_images($file,$exts,$path){
		$upload = new \Think\Upload();// 实例化上传类
		$upload->maxSize   =  3145728 ;// 设置附件上传大小3M
		$upload->exts      =  $exts;// 设置附件上传类型
		$upload->rootPath  =  './Data/UploadFiles/'; // 设置附件上传根目录
		$upload->savePath  =  ''; // 设置附件上传（子）目录
		$upload->saveName = time().mt_rand(100000,999999); //文件名称创建时间戳+随机数
		$upload->autoSub  = true; //自动使用子目录保存上传文件 默认为true
		$upload->subName  = $path; //子目录创建方式，采用数组或者字符串方式定义
		// 上传文件 
		$info = $upload->uploadOne($file);
		if(!$info) {// 上传错误提示错误信息
		    return $upload->getError();
		}else{// 上传成功 获取上传文件信息
			//return 'UploadFiles/'.$file['savepath'].$file['savename'];
			return $info;
		}
	}

}