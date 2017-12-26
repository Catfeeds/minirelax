<?php
namespace Ht\Controller;
use Think\Controller;
class UserController extends PublicController{

	//*************************
	// 普通会员的管理
	//*************************
	public function index(){
		$aaa_pts_qx=1;
		$type=$_GET['type'];
		$id=(int)$_GET['id'];
		$tel = trim($_REQUEST['tel']);
		$name = trim($_REQUEST['name']);

		$names=$this->htmlentities_u8($_GET['name']);
		//搜索
		$where="1=1";
		$name!='' ? $where.=" and name like '%$name%'" : null;
		$tel!='' ? $where.=" and tel like '%$tel%'" : null;

		define('rows',20);
		$count=M('user')->where($where)->count();
		$rows=ceil($count/rows);

		$page=(int)$_GET['page'];
		$page<0?$page=0:'';
		$limit=$page*rows;
		$userlist=M('user')->where($where)->order('id desc')->limit($limit,rows)->select();
		$page_index=$this->page_index($count,$rows,$page);
		foreach ($userlist as $k => $v) {
			$userlist[$k]['addtime']=date("Y-m-d H:i",$v['addtime']);
		}
		//====================
		// 将GET到的参数输出
		//=====================
		$this->assign('name',$name);
		$this->assign('tel',$tel);

		//=============
		//将变量输出
		//=============
		$this->assign('page_index',$page_index);
		$this->assign('page',$page);
		$this->assign('userlist',$userlist);
		$this->display();	
	}

	//*************************
	// 支付会员的管理
	//*************************
	public function moneyuser(){
		$aaa_pts_qx=1;
		$type=$_GET['type'];
		$id=(int)$_GET['id'];
		$tel = trim($_REQUEST['tel']);
		$name = trim($_REQUEST['name']);
		$usertype = intval($_REQUEST['usertype']);

		$names=$this->htmlentities_u8($_GET['name']);
		//搜索
		$where="1=1 AND type>1";
		$name!='' ? $where.=" and name like '%$name%'" : null;
		$tel!='' ? $where.=" and tel like '%$tel%'" : null;
		if ($usertype>0) {
			if ($usertype==4) {
				$where.=" AND type>3";
			} else {
				$where.=" AND type=".intval($usertype);
			}
		}

		define('rows',20);
		$count=M('user')->where($where)->count();
		$rows=ceil($count/rows);

		$page=(int)$_GET['page'];
		$page<0?$page=0:'';
		$limit=$page*rows;
		$userlist=M('user')->where($where)->order('id desc')->limit($limit,rows)->select();
		$page_index=$this->page_index($count,$rows,$page);
		foreach ($userlist as $k => $v) {
			$userlist[$k]['addtime']=date("Y-m-d H:i",$v['addtime']);
			$userlist[$k]['offtime']=date("Y-m-d H:i:s",$v['offtime']);
		}
		//=====================
		// 将GET到的参数输出
		//=====================
		$this->assign('name',$name);
		$this->assign('tel',$tel);
		$this->assign('usertype',$usertype);
		//=============
		//将变量输出
		//=============
		$this->assign('page_index',$page_index);
		$this->assign('page',$page);
		$this->assign('userlist',$userlist);
		$this->display();	
	}


	//*************************
	// 企业会员审核页面
	//*************************
	public function user_audit(){
		$id=(int)$_GET['id'];
		$check = M('user')->where('id='.intval($id).' AND del=0')->find();
		if (!$check) {
			$this->error('用户信息异常！');
			exit();
		}
		$check['addtime'] = date("Y-m-d",$check['addtime']);
		if (intval($check['offtime'])<=0) {
			$check['offtime']=0;
		}else{
			$check['offtime'] = date("Y-m-d",$check['offtime']);
		}

		$this->assign('info',$check);
		$this->display();
	}

	//*************************
	// 会员信息修改
	//*************************
	public function shenhe(){
		$id = intval($_POST['id']);
		$check = M('user')->where('id='.intval($id).' AND del=0')->find();
		if (!$check) {
			$this->error('用户信息异常！');
			exit();
		}

		$type = intval($_POST['type']);
		$tel = trim($_POST['tel']);
		$offtime = strtotime($_POST['offtime'].date("H:i:s"));

		$up = array();
		$up['type'] = $type;
		$up['tel'] = $tel;
		$up['is_qx'] = intval($_POST['is_qx']);
		$up['is_gl'] = intval($_POST['is_gl']);
		$up['offtime'] = $offtime;
		$res = M('user')->where('id='.intval($id))->save($up);
		if ($res) {
			$this->success('操作成功！');
			exit();
		}else{
			$this->error('操作失败！');
			exit();
		}
	}

	//*************************
	//		会员心得管理
	//*************************
	public function study(){
		//搜索
		$where="1=1";
		$name = $_REQUEST['name'];
		if ($name) {
			$idarr = M('user')->where('name LIKE "%'.$name.'%"')->field('id')->select();
			$arr = array();
			foreach ($idarr as $k => $v) {
				$arr[] = $v['id'];
			}
			if ($arr) {
				$where .= ' AND uid IN ('.implode(',', $arr).')';
			}
		}
		//=========================
		//define  每页显示的数量
		//=========================
		define('rows',20);
		$count=M('study')->where($where)->count();
		$rows=ceil($count/rows);
		$page=(int)$_GET['page'];
		$page<0?$page=0:'';
		$limit=$page*rows;
		$page_index = $this->page_index($count,$rows,$page);
		$list=M('study')->where($where)->order('addtime desc')->limit($limit,rows)->select();
		foreach ($list as $k => $v) {
			if (intval($v['pro_id'])>0) {
				$list[$k]['pname'] = M('product')->where('id='.intval($v['pro_id']))->getField('name');
			} else {
				$list[$k]['pname'] = 'VIP课程';
			}
			
			$list[$k]['uname'] = M('user')->where('id='.intval($v['uid']))->getField('name');
			$list[$k]['addtime'] = date('Y-m-d H:i',$v['addtime']);
		}
		//=============
		//将变量输出
		//=============
		$this->assign('page_index',$page_index);
		$this->assign('list',$list);
		$this->display();
	}

	//会员禁用恢复
	public function del()
	{
		$id = intval($_REQUEST['did']);
		$info = M('user')->where('id='.intval($id))->find();
		if (!$info) {
			$this->error('会员信息错误.'.__LINE__);
			exit();
		}

		$data=array();
		$data['del'] = $info['del'] == '1' ?  0 : 1;
		$up = M('user')->where('id='.intval($id))->save($data);
		if ($up) {
			$this->redirect('User/index',array('page'=>intval($_REQUEST['page'])));
			exit();
		}else{
			$this->error('操作失败.');
			exit();
		}
	}

	//*************************
	//	会员心得管理
	//*************************
	public function delstudy(){
		$id = intval($_REQUEST['did']);
		$info = M('study')->where('id='.intval($id))->find();
		if (!$info) {
			$this->error('信息异常.'.__LINE__);
			exit();
		}

		$up = M('study')->where('id='.intval($id))->delete();
		if ($up) {
			$this->redirect('study',array('page'=>intval($_REQUEST['page'])));
			exit();
		}else{
			$this->error('操作失败.');
			exit();
		}
	}

	//*************************
	//	设置会员 回答问题权限
	//*************************
	public function question () {
		//搜索
		$where="1=1";
		//=========================
		//define  每页显示的数量
		//=========================
		define('rows',20);
		$count=M('question')->where($where)->count();
		$rows=ceil($count/rows);
		$page=(int)$_GET['page'];
		$page<0?$page=0:'';
		$limit=$page*rows;
		$page_index = $this->page_index($count,$rows,$page);
		$list=M('question')->where($where)->order('is_top desc,addtime desc')->limit($limit,rows)->select();
		foreach ($list as $k => $v) {
			$list[$k]['uname'] = M('user')->where('id='.intval($v['uid']))->getField('name');
			$list[$k]['addtime'] = date('Y-m-d',$v['addtime']);
			$list[$k]['nums'] = intval(M('answer')->where('reply_id='.intval($v['id']))->getField('COUNT(id)'));
		}
		//=============
		//将变量输出
		//=============
		$this->assign('page_index',$page_index);
		$this->assign('page',$page);
		$this->assign('list',$list);
		$this->display();
	}


	//会员 问题置顶
	public function que_edit()
	{
		$id = intval($_REQUEST['id']);
		$info = M('question')->where('id='.intval($id))->find();
		if (!$info) {
			$this->error('数据信息错误.'.__LINE__);
			exit();
		}

		$data=array();
		$data['is_top'] = $info['is_top'] == '1' ?  0 : 1;
		$up = M('question')->where('id='.intval($id))->save($data);
		if ($up) {
			$this->redirect('question',array('page'=>intval($_REQUEST['page'])));
			exit();
		}else{
			$this->error('操作失败.');
			exit();
		}
	}

	//*************************
	//	会员问题删除
	//*************************
	public function delque(){
		$id = intval($_REQUEST['did']);
		$info = M('question')->where('id='.intval($id))->find();
		if (!$info) {
			$this->error('信息异常.'.__LINE__);
			exit();
		}

		$up = M('question')->where('id='.intval($id))->delete();
		if ($up) {
			$this->redirect('question',array('page'=>intval($_REQUEST['page'])));
			exit();
		}else{
			$this->error('操作失败.');
			exit();
		}
	}

}